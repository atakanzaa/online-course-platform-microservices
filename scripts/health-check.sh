#!/bin/bash

# Health Check Script for Online Course Platform
# Usage: ./health-check.sh [staging|production]

ENVIRONMENT=${1:-staging}
MAX_ATTEMPTS=30
ATTEMPT_INTERVAL=10

# Service endpoints based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://online-course-platform.com"
    API_BASE="https://api.online-course-platform.com"
else
    BASE_URL="http://staging.online-course-platform.com"
    API_BASE="http://staging-api.online-course-platform.com"
fi

# Infrastructure services (Docker internal)
SERVICES=(
    "config-server:8888"
    "discovery-server:8761"
    "api-gateway:8080"
    "user-service:8081"
    "course-service:8082"
    "payment-service:8083"
    "notification-service:8084"
    "media-service:8085"
    "analytics-service:8086"
)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Starting health checks for $ENVIRONMENT environment..."
echo "=================================================="

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local attempts=0
    
    echo -n "Checking $service_name... "
    
    while [ $attempts -lt $MAX_ATTEMPTS ]; do
        if curl -sf "http://$service_name:$port/actuator/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ HEALTHY${NC}"
            return 0
        fi
        
        attempts=$((attempts + 1))
        echo -n "."
        sleep $ATTEMPT_INTERVAL
    done
    
    echo -e "${RED}✗ UNHEALTHY${NC}"
    return 1
}

# Function to check external endpoint
check_external_endpoint() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name endpoint... "
    
    if curl -sf "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ ACCESSIBLE${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT ACCESSIBLE${NC}"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    echo -n "Checking PostgreSQL connectivity... "
    
    if docker exec -it $(docker ps -q -f name=postgres) pg_isready >/dev/null 2>&1; then
        echo -e "${GREEN}✓ CONNECTED${NC}"
        return 0
    else
        echo -e "${RED}✗ CONNECTION FAILED${NC}"
        return 1
    fi
}

# Function to check message queue
check_rabbitmq() {
    echo -n "Checking RabbitMQ... "
    
    if curl -sf "http://rabbitmq:15672/api/healthchecks/node" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        return 1
    fi
}

# Function to check Kafka
check_kafka() {
    echo -n "Checking Kafka... "
    
    if docker exec -it $(docker ps -q -f name=kafka) kafka-topics --bootstrap-server localhost:9092 --list >/dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        return 1
    fi
}

# Main health check execution
main() {
    local failed_checks=0
    
    echo "📊 Infrastructure Health Checks"
    echo "--------------------------------"
    
    # Check infrastructure services
    check_database || ((failed_checks++))
    check_rabbitmq || ((failed_checks++))
    check_kafka || ((failed_checks++))
    
    echo ""
    echo "🚀 Microservices Health Checks"
    echo "--------------------------------"
    
    # Check each microservice
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r name port <<< "$service"
        check_service "$name" "$port" || ((failed_checks++))
    done
    
    echo ""
    echo "🌐 External Endpoint Checks"
    echo "----------------------------"
    
    # Check external endpoints if available
    if [ "$ENVIRONMENT" != "local" ]; then
        check_external_endpoint "API Gateway" "$API_BASE/actuator/health" || ((failed_checks++))
        check_external_endpoint "User Service" "$API_BASE/users/health" || ((failed_checks++))
        check_external_endpoint "Course Service" "$API_BASE/courses/health" || ((failed_checks++))
        check_external_endpoint "Payment Service" "$API_BASE/payments/health" || ((failed_checks++))
    fi
    
    echo ""
    echo "=================================================="
    
    if [ $failed_checks -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed! Environment is ready.${NC}"
        
        # Integration test
        echo ""
        echo "🧪 Running integration tests..."
        ./scripts/integration-test.sh "$ENVIRONMENT"
        
        exit 0
    else
        echo -e "${RED}❌ $failed_checks health check(s) failed!${NC}"
        echo -e "${YELLOW}⚠️  Please check the logs and try again.${NC}"
        
        # Show recent logs for failed services
        echo ""
        echo "📋 Recent logs from potentially failed services:"
        echo "docker-compose logs --tail=50 config-server discovery-server api-gateway"
        
        exit 1
    fi
}

# Ensure script is executable and run main function
main "$@"
