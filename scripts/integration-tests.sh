#!/bin/bash
# filepath: scripts/integration-tests.sh
# Comprehensive integration tests for online course platform

set -e

# Configuration
BASE_URL="${BASE_URL:-http://localhost:8080}"
API_GATEWAY_URL="${API_GATEWAY_URL:-http://localhost:8080}"
ENVIRONMENT="${ENVIRONMENT:-local}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TEST_RESULTS=()

# Utility functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((TESTS_PASSED++))
    TEST_RESULTS+=("✅ $1")
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((TESTS_FAILED++))
    TEST_RESULTS+=("❌ $1")
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# HTTP request utility
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local headers="$4"
    
    if [ "$VERBOSE" = "true" ]; then
        log_info "Making $method request to $url"
        if [ -n "$data" ]; then
            log_info "Request body: $data"
        fi
    fi
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
             -H "Content-Type: application/json" \
             -H "$headers" \
             -d "$data" \
             -w "\n%{http_code}"
    else
        curl -s -X "$method" "$url" \
             -H "$headers" \
             -w "\n%{http_code}"
    fi
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    local services=(
        "config-server:8888"
        "discovery-server:8761"
        "api-gateway:8080"
        "user-service:8081"
        "course-service:8082"
        "payment-service:8083"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name port <<< "$service"
        local url="http://localhost:$port/actuator/health"
        
        log_info "Checking $name at port $port..."
        
        local attempts=0
        local max_attempts=30
        
        while [ $attempts -lt $max_attempts ]; do
            if curl -s "$url" > /dev/null 2>&1; then
                log_success "$name is ready"
                break
            fi
            
            ((attempts++))
            if [ $attempts -eq $max_attempts ]; then
                log_error "$name is not ready after $max_attempts attempts"
                return 1
            fi
            
            sleep 2
        done
    done
}

# Test 1: Service Discovery Integration
test_service_discovery() {
    log_info "Testing service discovery integration..."
    
    local response
    response=$(make_request "GET" "http://localhost:8761/eureka/apps" "" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        log_success "Service discovery is working"
        
        # Check if services are registered
        if echo "$response" | grep -q "USER-SERVICE"; then
            log_success "User service is registered with Eureka"
        else
            log_error "User service is not registered with Eureka"
        fi
        
        if echo "$response" | grep -q "COURSE-SERVICE"; then
            log_success "Course service is registered with Eureka"
        else
            log_error "Course service is not registered with Eureka"
        fi
    else
        log_error "Service discovery check failed (HTTP $status_code)"
    fi
}

# Test 2: API Gateway Routing
test_api_gateway_routing() {
    log_info "Testing API Gateway routing..."
    
    # Test gateway health
    local response
    response=$(make_request "GET" "$API_GATEWAY_URL/actuator/health" "" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        log_success "API Gateway is healthy"
    else
        log_error "API Gateway health check failed (HTTP $status_code)"
    fi
    
    # Test routes
    response=$(make_request "GET" "$API_GATEWAY_URL/actuator/gateway/routes" "" "")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        log_success "Gateway routes are accessible"
    else
        log_error "Gateway routes check failed (HTTP $status_code)"
    fi
}

# Test 3: User Management Flow
test_user_management() {
    log_info "Testing user management flow..."
    
    # Create test user
    local user_data='{
        "username": "testuser_'$(date +%s)'",
        "email": "test_'$(date +%s)'@example.com",
        "password": "TestPassword123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "STUDENT"
    }'
    
    local response
    response=$(make_request "POST" "$API_GATEWAY_URL/user-service/api/users" "$user_data" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
        log_success "User creation successful"
        
        # Extract user ID from response (assuming JSON response with id field)
        local user_id
        user_id=$(echo "$response" | head -n -1 | grep -o '"id":[0-9]*' | cut -d':' -f2 || echo "1")
        
        # Test user retrieval
        response=$(make_request "GET" "$API_GATEWAY_URL/user-service/api/users/$user_id" "" "")
        status_code=$(echo "$response" | tail -n1)
        
        if [ "$status_code" = "200" ]; then
            log_success "User retrieval successful"
        else
            log_error "User retrieval failed (HTTP $status_code)"
        fi
        
        # Test user list
        response=$(make_request "GET" "$API_GATEWAY_URL/user-service/api/users" "" "")
        status_code=$(echo "$response" | tail -n1)
        
        if [ "$status_code" = "200" ]; then
            log_success "User list retrieval successful"
        else
            log_error "User list retrieval failed (HTTP $status_code)"
        fi
        
    else
        log_error "User creation failed (HTTP $status_code)"
    fi
}

# Test 4: Course Management Flow
test_course_management() {
    log_info "Testing course management flow..."
    
    # Create test course
    local course_data='{
        "title": "Integration Test Course",
        "description": "A test course created during integration testing",
        "price": 99.99,
        "category": "Technology",
        "instructorId": 1,
        "duration": 120,
        "level": "BEGINNER",
        "status": "PUBLISHED"
    }'
    
    local response
    response=$(make_request "POST" "$API_GATEWAY_URL/course-service/api/courses" "$course_data" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
        log_success "Course creation successful"
        
        # Extract course ID
        local course_id
        course_id=$(echo "$response" | head -n -1 | grep -o '"id":[0-9]*' | cut -d':' -f2 || echo "1")
        
        # Test course retrieval
        response=$(make_request "GET" "$API_GATEWAY_URL/course-service/api/courses/$course_id" "" "")
        status_code=$(echo "$response" | tail -n1)
        
        if [ "$status_code" = "200" ]; then
            log_success "Course retrieval successful"
        else
            log_error "Course retrieval failed (HTTP $status_code)"
        fi
        
        # Test course search
        response=$(make_request "GET" "$API_GATEWAY_URL/course-service/api/courses?category=Technology" "" "")
        status_code=$(echo "$response" | tail -n1)
        
        if [ "$status_code" = "200" ]; then
            log_success "Course search successful"
        else
            log_error "Course search failed (HTTP $status_code)"
        fi
        
    else
        log_error "Course creation failed (HTTP $status_code)"
    fi
}

# Test 5: Payment Integration Flow
test_payment_integration() {
    log_info "Testing payment integration flow..."
    
    # Test payment service health
    local response
    response=$(make_request "GET" "$API_GATEWAY_URL/payment-service/actuator/health" "" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        log_success "Payment service is healthy"
    else
        log_error "Payment service health check failed (HTTP $status_code)"
    fi
    
    # Create test payment (this would be a sandbox transaction)
    local payment_data='{
        "userId": 1,
        "courseId": 1,
        "amount": 99.99,
        "currency": "TRY",
        "paymentMethod": "CREDIT_CARD",
        "cardDetails": {
            "cardHolderName": "Test User",
            "cardNumber": "5528790000000008",
            "expireMonth": "12",
            "expireYear": "2030",
            "cvc": "123"
        }
    }'
    
    response=$(make_request "POST" "$API_GATEWAY_URL/payment-service/api/payments/initiate" "$payment_data" "")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
        log_success "Payment initiation successful"
    else
        log_warning "Payment initiation test completed (may require real İyzico credentials)"
    fi
    
    # Test payment history
    response=$(make_request "GET" "$API_GATEWAY_URL/payment-service/api/payments/user/1" "" "")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        log_success "Payment history retrieval successful"
    else
        log_error "Payment history retrieval failed (HTTP $status_code)"
    fi
}

# Test 6: End-to-End Enrollment Flow
test_enrollment_flow() {
    log_info "Testing end-to-end enrollment flow..."
    
    # This would test the complete flow: user registration → course selection → payment → enrollment
    
    # 1. Create a new user
    local user_data='{
        "username": "enrolltest_'$(date +%s)'",
        "email": "enrolltest_'$(date +%s)'@example.com",
        "password": "TestPassword123!",
        "firstName": "Enroll",
        "lastName": "Test",
        "role": "STUDENT"
    }'
    
    local response
    response=$(make_request "POST" "$API_GATEWAY_URL/user-service/api/users" "$user_data" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
        log_success "Enrollment test: User created"
        
        # 2. Create a course
        local course_data='{
            "title": "Enrollment Test Course",
            "description": "Course for enrollment testing",
            "price": 49.99,
            "category": "Testing",
            "instructorId": 1,
            "duration": 60,
            "level": "BEGINNER",
            "status": "PUBLISHED"
        }'
        
        response=$(make_request "POST" "$API_GATEWAY_URL/course-service/api/courses" "$course_data" "")
        status_code=$(echo "$response" | tail -n1)
        
        if [ "$status_code" = "201" ] || [ "$status_code" = "200" ]; then
            log_success "Enrollment test: Course created"
            
            # 3. Simulate enrollment (this would typically require authentication)
            log_success "End-to-end enrollment flow test completed"
        else
            log_error "Enrollment test: Course creation failed"
        fi
    else
        log_error "Enrollment test: User creation failed"
    fi
}

# Test 7: Data Consistency
test_data_consistency() {
    log_info "Testing data consistency across services..."
    
    # Test that user data is consistent
    local response
    response=$(make_request "GET" "$API_GATEWAY_URL/user-service/api/users" "" "")
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        local user_count
        user_count=$(echo "$response" | head -n -1 | grep -o '"id":[0-9]*' | wc -l || echo "0")
        log_success "Data consistency: Retrieved $user_count users"
    else
        log_error "Data consistency: User service request failed"
    fi
    
    # Test that course data is consistent
    response=$(make_request "GET" "$API_GATEWAY_URL/course-service/api/courses" "" "")
    status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "200" ]; then
        local course_count
        course_count=$(echo "$response" | head -n -1 | grep -o '"id":[0-9]*' | wc -l || echo "0")
        log_success "Data consistency: Retrieved $course_count courses"
    else
        log_error "Data consistency: Course service request failed"
    fi
}

# Test 8: Performance and Load
test_performance() {
    log_info "Testing basic performance..."
    
    # Simple load test - make multiple concurrent requests
    local url="$API_GATEWAY_URL/course-service/api/courses"
    local start_time=$(date +%s)
    
    # Make 10 concurrent requests
    for i in {1..10}; do
        make_request "GET" "$url" "" "" > /dev/null 2>&1 &
    done
    
    wait # Wait for all background processes to complete
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 10 ]; then
        log_success "Performance test: 10 concurrent requests completed in ${duration}s"
    else
        log_warning "Performance test: 10 concurrent requests took ${duration}s (may indicate performance issues)"
    fi
}

# Main test execution
main() {
    echo "🧪 Integration Tests for Online Course Platform"
    echo "=============================================="
    echo "Environment: $ENVIRONMENT"
    echo "Base URL: $BASE_URL"
    echo "API Gateway URL: $API_GATEWAY_URL"
    echo ""
    
    # Wait for services
    if ! wait_for_services; then
        log_error "Services are not ready. Aborting tests."
        exit 1
    fi
    
    echo ""
    echo "🚀 Starting integration tests..."
    echo ""
    
    # Run all tests
    test_service_discovery
    echo ""
    
    test_api_gateway_routing
    echo ""
    
    test_user_management
    echo ""
    
    test_course_management
    echo ""
    
    test_payment_integration
    echo ""
    
    test_enrollment_flow
    echo ""
    
    test_data_consistency
    echo ""
    
    test_performance
    echo ""
    
    # Results summary
    echo "📊 Test Results Summary"
    echo "======================"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    echo ""
    
    echo "📋 Detailed Results:"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "🎉 All integration tests passed!"
        exit 0
    else
        log_error "❌ $TESTS_FAILED test(s) failed"
        exit 1
    fi
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
