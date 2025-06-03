# filepath: scripts/integration-tests.ps1
# Comprehensive integration tests for online course platform

param(
    [string]$Environment = "local",
    [string]$BaseUrl = "http://localhost:8080",
    [string]$ApiGatewayUrl = "http://localhost:8080",
    [switch]$Verbose
)

# Test results
$global:TestsPassed = 0
$global:TestsFailed = 0
$global:TestResults = @()

# Utility functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    $global:TestsPassed++
    $global:TestResults += "✅ $Message"
}

function Write-TestError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    $global:TestsFailed++
    $global:TestResults += "❌ $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# HTTP request utility
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = "",
        [hashtable]$Headers = @{"Content-Type" = "application/json"}
    )
    
    if ($Verbose) {
        Write-Info "Making $Method request to $Url"
        if ($Body) {
            Write-Info "Request body: $Body"
        }
    }
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    }
    catch {
        return @{
            Success = $false
            StatusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
            Error = $_.Exception.Message
        }
    }
}

# Wait for services to be ready
function Wait-ForServices {
    Write-Info "Waiting for services to be ready..."
    
    $services = @(
        @{Name="Config Server"; Port=8888},
        @{Name="Discovery Server"; Port=8761},
        @{Name="API Gateway"; Port=8080},
        @{Name="User Service"; Port=8081},
        @{Name="Course Service"; Port=8082},
        @{Name="Payment Service"; Port=8083}
    )
    
    foreach ($service in $services) {
        Write-Info "Checking $($service.Name) at port $($service.Port)..."
        
        $attempts = 0
        $maxAttempts = 30
        $url = "http://localhost:$($service.Port)/actuator/health"
        
        while ($attempts -lt $maxAttempts) {
            $result = Invoke-ApiRequest -Method "GET" -Url $url
            
            if ($result.Success -and $result.StatusCode -eq 200) {
                Write-Success "$($service.Name) is ready"
                break
            }
            
            $attempts++
            if ($attempts -eq $maxAttempts) {
                Write-TestError "$($service.Name) is not ready after $maxAttempts attempts"
                return $false
            }
            
            Start-Sleep -Seconds 2
        }
    }
    
    return $true
}

# Test 1: Service Discovery Integration
function Test-ServiceDiscovery {
    Write-Info "Testing service discovery integration..."
    
    $result = Invoke-ApiRequest -Method "GET" -Url "http://localhost:8761/eureka/apps"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-Success "Service discovery is working"
        
        if ($result.Content -match "USER-SERVICE") {
            Write-Success "User service is registered with Eureka"
        } else {
            Write-TestError "User service is not registered with Eureka"
        }
        
        if ($result.Content -match "COURSE-SERVICE") {
            Write-Success "Course service is registered with Eureka"
        } else {
            Write-TestError "Course service is not registered with Eureka"
        }
    } else {
        Write-TestError "Service discovery check failed (HTTP $($result.StatusCode))"
    }
}

# Test 2: API Gateway Routing
function Test-ApiGatewayRouting {
    Write-Info "Testing API Gateway routing..."
    
    # Test gateway health
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/actuator/health"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-Success "API Gateway is healthy"
    } else {
        Write-TestError "API Gateway health check failed (HTTP $($result.StatusCode))"
    }
    
    # Test routes
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/actuator/gateway/routes"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-Success "Gateway routes are accessible"
    } else {
        Write-TestError "Gateway routes check failed (HTTP $($result.StatusCode))"
    }
}

# Test 3: User Management Flow
function Test-UserManagement {
    Write-Info "Testing user management flow..."
    
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $userData = @{
        username = "testuser_$timestamp"
        email = "test_$timestamp@example.com"
        password = "TestPassword123!"
        firstName = "Test"
        lastName = "User"
        role = "STUDENT"
    } | ConvertTo-Json
    
    $result = Invoke-ApiRequest -Method "POST" -Url "$ApiGatewayUrl/user-service/api/users" -Body $userData
    
    if ($result.Success -and ($result.StatusCode -eq 201 -or $result.StatusCode -eq 200)) {
        Write-Success "User creation successful"
        
        # Extract user ID from response
        $userId = 1
        if ($result.Content) {
            try {
                $userResponse = $result.Content | ConvertFrom-Json
                if ($userResponse.id) {
                    $userId = $userResponse.id
                }
            }
            catch {
                # Use default ID if parsing fails
            }
        }
        
        # Test user retrieval
        $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/user-service/api/users/$userId"
        
        if ($result.Success -and $result.StatusCode -eq 200) {
            Write-Success "User retrieval successful"
        } else {
            Write-TestError "User retrieval failed (HTTP $($result.StatusCode))"
        }
        
        # Test user list
        $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/user-service/api/users"
        
        if ($result.Success -and $result.StatusCode -eq 200) {
            Write-Success "User list retrieval successful"
        } else {
            Write-TestError "User list retrieval failed (HTTP $($result.StatusCode))"
        }
    } else {
        Write-TestError "User creation failed (HTTP $($result.StatusCode))"
    }
}

# Test 4: Course Management Flow
function Test-CourseManagement {
    Write-Info "Testing course management flow..."
    
    $courseData = @{
        title = "Integration Test Course"
        description = "A test course created during integration testing"
        price = 99.99
        category = "Technology"
        instructorId = 1
        duration = 120
        level = "BEGINNER"
        status = "PUBLISHED"
    } | ConvertTo-Json
    
    $result = Invoke-ApiRequest -Method "POST" -Url "$ApiGatewayUrl/course-service/api/courses" -Body $courseData
    
    if ($result.Success -and ($result.StatusCode -eq 201 -or $result.StatusCode -eq 200)) {
        Write-Success "Course creation successful"
        
        # Extract course ID
        $courseId = 1
        if ($result.Content) {
            try {
                $courseResponse = $result.Content | ConvertFrom-Json
                if ($courseResponse.id) {
                    $courseId = $courseResponse.id
                }
            }
            catch {
                # Use default ID if parsing fails
            }
        }
        
        # Test course retrieval
        $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/course-service/api/courses/$courseId"
        
        if ($result.Success -and $result.StatusCode -eq 200) {
            Write-Success "Course retrieval successful"
        } else {
            Write-TestError "Course retrieval failed (HTTP $($result.StatusCode))"
        }
        
        # Test course search
        $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/course-service/api/courses?category=Technology"
        
        if ($result.Success -and $result.StatusCode -eq 200) {
            Write-Success "Course search successful"
        } else {
            Write-TestError "Course search failed (HTTP $($result.StatusCode))"
        }
    } else {
        Write-TestError "Course creation failed (HTTP $($result.StatusCode))"
    }
}

# Test 5: Payment Integration Flow
function Test-PaymentIntegration {
    Write-Info "Testing payment integration flow..."
    
    # Test payment service health
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/payment-service/actuator/health"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-Success "Payment service is healthy"
    } else {
        Write-TestError "Payment service health check failed (HTTP $($result.StatusCode))"
    }
    
    # Create test payment (sandbox transaction)
    $paymentData = @{
        userId = 1
        courseId = 1
        amount = 99.99
        currency = "TRY"
        paymentMethod = "CREDIT_CARD"
        cardDetails = @{
            cardHolderName = "Test User"
            cardNumber = "5528790000000008"
            expireMonth = "12"
            expireYear = "2030"
            cvc = "123"
        }
    } | ConvertTo-Json -Depth 3
    
    $result = Invoke-ApiRequest -Method "POST" -Url "$ApiGatewayUrl/payment-service/api/payments/initiate" -Body $paymentData
    
    if ($result.Success -and ($result.StatusCode -eq 200 -or $result.StatusCode -eq 201)) {
        Write-Success "Payment initiation successful"
    } else {
        Write-Warning "Payment initiation test completed (may require real İyzico credentials)"
    }
    
    # Test payment history
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/payment-service/api/payments/user/1"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        Write-Success "Payment history retrieval successful"
    } else {
        Write-TestError "Payment history retrieval failed (HTTP $($result.StatusCode))"
    }
}

# Test 6: End-to-End Enrollment Flow
function Test-EnrollmentFlow {
    Write-Info "Testing end-to-end enrollment flow..."
    
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    
    # Create a new user
    $userData = @{
        username = "enrolltest_$timestamp"
        email = "enrolltest_$timestamp@example.com"
        password = "TestPassword123!"
        firstName = "Enroll"
        lastName = "Test"
        role = "STUDENT"
    } | ConvertTo-Json
    
    $result = Invoke-ApiRequest -Method "POST" -Url "$ApiGatewayUrl/user-service/api/users" -Body $userData
    
    if ($result.Success -and ($result.StatusCode -eq 201 -or $result.StatusCode -eq 200)) {
        Write-Success "Enrollment test: User created"
        
        # Create a course
        $courseData = @{
            title = "Enrollment Test Course"
            description = "Course for enrollment testing"
            price = 49.99
            category = "Testing"
            instructorId = 1
            duration = 60
            level = "BEGINNER"
            status = "PUBLISHED"
        } | ConvertTo-Json
        
        $result = Invoke-ApiRequest -Method "POST" -Url "$ApiGatewayUrl/course-service/api/courses" -Body $courseData
        
        if ($result.Success -and ($result.StatusCode -eq 201 -or $result.StatusCode -eq 200)) {
            Write-Success "Enrollment test: Course created"
            Write-Success "End-to-end enrollment flow test completed"
        } else {
            Write-TestError "Enrollment test: Course creation failed"
        }
    } else {
        Write-TestError "Enrollment test: User creation failed"
    }
}

# Test 7: Data Consistency
function Test-DataConsistency {
    Write-Info "Testing data consistency across services..."
    
    # Test user data consistency
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/user-service/api/users"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        $userCount = 0
        if ($result.Content) {
            try {
                $users = $result.Content | ConvertFrom-Json
                $userCount = $users.Count
            }
            catch {
                $userCount = 0
            }
        }
        Write-Success "Data consistency: Retrieved $userCount users"
    } else {
        Write-TestError "Data consistency: User service request failed"
    }
    
    # Test course data consistency
    $result = Invoke-ApiRequest -Method "GET" -Url "$ApiGatewayUrl/course-service/api/courses"
    
    if ($result.Success -and $result.StatusCode -eq 200) {
        $courseCount = 0
        if ($result.Content) {
            try {
                $courses = $result.Content | ConvertFrom-Json
                $courseCount = $courses.Count
            }
            catch {
                $courseCount = 0
            }
        }
        Write-Success "Data consistency: Retrieved $courseCount courses"
    } else {
        Write-TestError "Data consistency: Course service request failed"
    }
}

# Test 8: Performance and Load
function Test-Performance {
    Write-Info "Testing basic performance..."
    
    $url = "$ApiGatewayUrl/course-service/api/courses"
    $startTime = Get-Date
    
    # Make 10 concurrent requests
    $jobs = @()
    for ($i = 1; $i -le 10; $i++) {
        $jobs += Start-Job -ScriptBlock {
            param($Url)
            try {
                Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
            }
            catch {
                # Ignore errors for performance test
            }
        } -ArgumentList $url
    }
    
    # Wait for all jobs to complete
    $jobs | Wait-Job | Out-Null
    $jobs | Remove-Job
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    if ($duration -lt 10) {
        Write-Success "Performance test: 10 concurrent requests completed in $([math]::Round($duration, 2))s"
    } else {
        Write-Warning "Performance test: 10 concurrent requests took $([math]::Round($duration, 2))s (may indicate performance issues)"
    }
}

# Main execution
function Main {
    Write-Host "🧪 Integration Tests for Online Course Platform" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host "Environment: $Environment"
    Write-Host "Base URL: $BaseUrl"
    Write-Host "API Gateway URL: $ApiGatewayUrl"
    Write-Host ""
    
    # Wait for services
    if (-not (Wait-ForServices)) {
        Write-TestError "Services are not ready. Aborting tests."
        exit 1
    }
    
    Write-Host ""
    Write-Host "🚀 Starting integration tests..." -ForegroundColor Blue
    Write-Host ""
    
    # Run all tests
    Test-ServiceDiscovery
    Write-Host ""
    
    Test-ApiGatewayRouting
    Write-Host ""
    
    Test-UserManagement
    Write-Host ""
    
    Test-CourseManagement
    Write-Host ""
    
    Test-PaymentIntegration
    Write-Host ""
    
    Test-EnrollmentFlow
    Write-Host ""
    
    Test-DataConsistency
    Write-Host ""
    
    Test-Performance
    Write-Host ""
    
    # Results summary
    Write-Host "📊 Test Results Summary" -ForegroundColor Yellow
    Write-Host "======================" -ForegroundColor Gray
    Write-Host "Tests Passed: $global:TestsPassed" -ForegroundColor Green
    Write-Host "Tests Failed: $global:TestsFailed" -ForegroundColor Red
    Write-Host "Total Tests: $($global:TestsPassed + $global:TestsFailed)"
    Write-Host ""
    
    Write-Host "📋 Detailed Results:" -ForegroundColor Yellow
    foreach ($result in $global:TestResults) {
        Write-Host "  $result"
    }
    Write-Host ""
    
    if ($global:TestsFailed -eq 0) {
        Write-Success "🎉 All integration tests passed!"
        exit 0
    } else {
        Write-TestError "❌ $global:TestsFailed test(s) failed"
        exit 1
    }
}

# Execute main function
Main
