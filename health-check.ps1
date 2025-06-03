# Comprehensive microservices health checker
param(
    [string]$Environment = "local",
    [string]$Host = "localhost",
    [switch]$Verbose
)

Write-Host "🔍 Microservices Health Check ($Environment)" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Yellow

# Define all microservices
$services = @(
    @{Name="Config Server"; Port=8888; BaseUrl="http://${Host}:8888"; ContextPath=""; HealthPath="/actuator/health"},
    @{Name="Discovery Server"; Port=8761; BaseUrl="http://${Host}:8761"; ContextPath=""; HealthPath="/actuator/health"},
    @{Name="API Gateway"; Port=8080; BaseUrl="http://${Host}:8080"; ContextPath=""; HealthPath="/actuator/health"},
    @{Name="User Service"; Port=8081; BaseUrl="http://${Host}:8081"; ContextPath="/user-service"; HealthPath="/user-service/actuator/health"},
    @{Name="Course Service"; Port=8082; BaseUrl="http://${Host}:8082"; ContextPath="/course-service"; HealthPath="/course-service/actuator/health"},
    @{Name="Payment Service"; Port=8083; BaseUrl="http://${Host}:8083"; ContextPath="/payment-service"; HealthPath="/payment-service/actuator/health"},
    @{Name="Notification Service"; Port=8084; BaseUrl="http://${Host}:8084"; ContextPath="/notification-service"; HealthPath="/notification-service/actuator/health"},
    @{Name="Media Service"; Port=8085; BaseUrl="http://${Host}:8085"; ContextPath="/media-service"; HealthPath="/media-service/actuator/health"},
    @{Name="Analytics Service"; Port=8086; BaseUrl="http://${Host}:8086"; ContextPath="/analytics-service"; HealthPath="/analytics-service/actuator/health"}
)

$healthResults = @()

foreach ($service in $services) {
    Write-Host "`n🔍 Testing $($service.Name) on port $($service.Port)..." -ForegroundColor Cyan
    
    $serviceResult = @{
        Name = $service.Name
        Port = $service.Port
        PortListening = $false
        HealthStatus = "Unknown"
        ResponseTime = 0
        Endpoints = @()
    }
    
    # Test port connectivity
    $portTest = Test-NetConnection -ComputerName $Host -Port $service.Port -WarningAction SilentlyContinue
    if ($portTest.TcpTestSucceeded) {
        Write-Host "  ✅ Port $($service.Port): LISTENING" -ForegroundColor Green
        $serviceResult.PortListening = $true
        
        # Test health endpoint
        $healthUrl = "$($service.BaseUrl)$($service.HealthPath)"
        try {
            $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            $response = Invoke-WebRequest -Uri $healthUrl -Method GET -TimeoutSec 5 -ErrorAction Stop
            $stopwatch.Stop()
            $serviceResult.ResponseTime = $stopwatch.ElapsedMilliseconds
            
            if ($response.StatusCode -eq 200) {
                $healthData = $response.Content | ConvertFrom-Json
                $serviceResult.HealthStatus = $healthData.status
                Write-Host "  ✅ Health: $($healthData.status) ($($serviceResult.ResponseTime)ms)" -ForegroundColor Green
            }
        }
        catch {
            $serviceResult.HealthStatus = "ERROR"
            Write-Host "  ❌ Health: ERROR" -ForegroundColor Red
            if ($Verbose) {
                Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # Test additional endpoints based on service type
        $endpoints = @()
        switch ($service.Name) {
            "Discovery Server" { $endpoints = @("/") }
            "API Gateway" { $endpoints = @("/actuator/gateway/routes") }
            "User Service" { $endpoints = @("$($service.ContextPath)/api/users") }
            "Course Service" { $endpoints = @("$($service.ContextPath)/api/courses") }
            "Payment Service" { $endpoints = @("$($service.ContextPath)/api/payments") }
            "Notification Service" { $endpoints = @("$($service.ContextPath)/api/notifications") }
            "Media Service" { $endpoints = @("$($service.ContextPath)/api/media") }
            "Analytics Service" { $endpoints = @("$($service.ContextPath)/api/analytics") }
        }
        
        foreach ($endpoint in $endpoints) {
            $url = "$($service.BaseUrl)$endpoint"
            try {
                $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 3 -ErrorAction Stop
                Write-Host "  ✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
                $serviceResult.Endpoints += @{Path=$endpoint; Status=$response.StatusCode; Success=$true}
            }
            catch {
                $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Connection Failed" }
                Write-Host "  ❌ $endpoint : $statusCode" -ForegroundColor Red
                $serviceResult.Endpoints += @{Path=$endpoint; Status=$statusCode; Success=$false}
            }
        }
    } else {
        Write-Host "  ❌ Port $($service.Port): NOT LISTENING" -ForegroundColor Red
    }
    
    $healthResults += $serviceResult
}

Write-Host "`n📊 Health Check Summary:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Gray

$healthyServices = ($healthResults | Where-Object { $_.PortListening -and $_.HealthStatus -eq "UP" }).Count
$totalServices = $healthResults.Count

Write-Host "Overall Status: $healthyServices/$totalServices services healthy" -ForegroundColor $(if ($healthyServices -eq $totalServices) { "Green" } else { "Yellow" })

foreach ($result in $healthResults) {
    $status = if ($result.PortListening -and $result.HealthStatus -eq "UP") { "✅" } else { "❌" }
    $responseInfo = if ($result.ResponseTime -gt 0) { " ($($result.ResponseTime)ms)" } else { "" }
    Write-Host "$status $($result.Name): $($result.HealthStatus)$responseInfo"
}

# Service dependency check
Write-Host "`n🔗 Service Dependencies:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Gray

$configServer = $healthResults | Where-Object { $_.Name -eq "Config Server" }
$discoveryServer = $healthResults | Where-Object { $_.Name -eq "Discovery Server" }
$gateway = $healthResults | Where-Object { $_.Name -eq "API Gateway" }

if ($configServer.HealthStatus -ne "UP") {
    Write-Host "⚠️  Config Server is down - other services may have configuration issues" -ForegroundColor Yellow
}

if ($discoveryServer.HealthStatus -ne "UP") {
    Write-Host "⚠️  Discovery Server is down - service discovery will not work" -ForegroundColor Yellow
}

if ($gateway.HealthStatus -ne "UP") {
    Write-Host "⚠️  API Gateway is down - external access to services will be limited" -ForegroundColor Yellow
}

# Performance analysis
Write-Host "`n⚡ Performance Analysis:" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Gray

$avgResponseTime = ($healthResults | Where-Object { $_.ResponseTime -gt 0 } | Measure-Object -Property ResponseTime -Average).Average
if ($avgResponseTime -gt 0) {
    Write-Host "Average response time: $([math]::Round($avgResponseTime, 2))ms"
    
    $slowServices = $healthResults | Where-Object { $_.ResponseTime -gt 1000 }
    if ($slowServices.Count -gt 0) {
        Write-Host "Slow services (>1000ms):" -ForegroundColor Yellow
        foreach ($slow in $slowServices) {
            Write-Host "  - $($slow.Name): $($slow.ResponseTime)ms" -ForegroundColor Yellow
        }
    }
}

# Docker status check (if running in containerized environment)
if ($Environment -ne "local") {
    Write-Host "`n🐳 Docker Container Status:" -ForegroundColor Yellow
    Write-Host "=============================" -ForegroundColor Gray
    
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host $containers
        } else {
            Write-Host "Docker not available or not running" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Docker commands not available" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Recommendations:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Gray

$downServices = $healthResults | Where-Object { -not $_.PortListening -or $_.HealthStatus -ne "UP" }
if ($downServices.Count -gt 0) {
    Write-Host "1. Restart the following services:" -ForegroundColor Yellow
    foreach ($down in $downServices) {
        Write-Host "   - $($down.Name)" -ForegroundColor Red
    }
}

if ($avgResponseTime -gt 500) {
    Write-Host "2. Consider investigating performance issues (avg response time: $([math]::Round($avgResponseTime, 2))ms)" -ForegroundColor Yellow
}

if ($healthyServices -eq $totalServices) {
    Write-Host "🎉 All services are healthy and running!" -ForegroundColor Green
} else {
    Write-Host "⚠️  $($totalServices - $healthyServices) service(s) need attention" -ForegroundColor Yellow
}

Write-Host "`nHealth check completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

try {
    Write-Host "`n📚 Testing Course Service API..." -ForegroundColor Magenta
    $courseResponse = Invoke-RestMethod -Uri "http://localhost:8082/course-service/api/courses" -Method GET -TimeoutSec 5
    Write-Host "✅ Course Service API: Working" -ForegroundColor Green
    Write-Host "   Courses found: $($courseResponse.Count)" -ForegroundColor White
}
catch {
    Write-Host "❌ Course Service API: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
}

try {
    Write-Host "`n💳 Testing Payment Service Health..." -ForegroundColor Magenta
    $paymentHealth = Invoke-RestMethod -Uri "http://localhost:8083/payment-service/actuator/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Payment Service Health: $($paymentHealth.status)" -ForegroundColor Green
}
catch {
    try {
        # Try alternative endpoint
        $paymentResponse = Invoke-RestMethod -Uri "http://localhost:8083/payment-service/api/payments/user/1" -Method GET -TimeoutSec 5
        Write-Host "✅ Payment Service API: Working" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Payment Service: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Gray
    }
}

Write-Host "`n🎯 Summary:" -ForegroundColor Green
Write-Host "Services are running on their ports, testing endpoints..."
