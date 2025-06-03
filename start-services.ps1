# PowerShell script to start microservices in the correct order
# Online Course Platform - Service Startup Script

Write-Host "🚀 Starting Online Course Platform Microservices" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Change to project directory
Set-Location -Path "c:/Users/Yel/Desktop/online-course-platform"

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port,
        [int]$DelaySeconds = 30
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Cyan
    Set-Location -Path $ServicePath
      # Start the service in a new PowerShell window
    $command = ".\mvnw.cmd spring-boot:run -Dspring.profiles.active=dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -WindowStyle Normal
    
    Write-Host "$ServiceName started. Waiting $DelaySeconds seconds..." -ForegroundColor Green
    Start-Sleep -Seconds $DelaySeconds
    
    # Return to main directory
    Set-Location -Path "c:/Users/Yel/Desktop/online-course-platform"
}

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "📊 Checking prerequisites..." -ForegroundColor Yellow

# Check if Java is available
try {
    java -version 2>$null
    Write-Host "✅ Java is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Java is not available. Please install Java 21 or later." -ForegroundColor Red
    exit 1
}

# Check if Maven is available
try {
    mvn -version 2>$null
    Write-Host "✅ Maven is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Maven is not available. Please install Maven 3.8 or later." -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Starting services in order..." -ForegroundColor Yellow

# Start services in the correct order
Write-Host "`n1️⃣ Starting Course Service (core dependency)..." -ForegroundColor Magenta
Start-Service -ServiceName "Course Service" -ServicePath "course-service" -Port 8082 -DelaySeconds 25

Write-Host "`n2️⃣ Starting Payment Service..." -ForegroundColor Magenta  
Start-Service -ServiceName "Payment Service" -ServicePath "payment-service" -Port 8083 -DelaySeconds 25

Write-Host "`n3️⃣ Starting Notification Service..." -ForegroundColor Magenta
Start-Service -ServiceName "Notification Service" -ServicePath "notification-service" -Port 8084 -DelaySeconds 20

Write-Host "`n⏰ Waiting for all services to fully initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`n🧪 Testing service connectivity..." -ForegroundColor Yellow

# Test services
$services = @(
    @{Name="Course Service"; Port=8082; Endpoint="http://localhost:8082/api/courses"},
    @{Name="Payment Service"; Port=8083; Endpoint="http://localhost:8083/actuator/health"},
    @{Name="Notification Service"; Port=8084; Endpoint="http://localhost:8084/actuator/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Endpoint -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name): RESPONDING (Status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name): NOT RESPONDING" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Service startup complete!" -ForegroundColor Green
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  📚 Course Service:     http://localhost:8082/api/courses" -ForegroundColor White
Write-Host "  💳 Payment Service:    http://localhost:8083/api/payments" -ForegroundColor White  
Write-Host "  📧 Notification:       http://localhost:8084/actuator/health" -ForegroundColor White

Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run integration tests: .\test-integration.ps1" -ForegroundColor White
Write-Host "2. Start infrastructure: docker-compose up -d" -ForegroundColor White
Write-Host "3. View logs in each service window" -ForegroundColor White
