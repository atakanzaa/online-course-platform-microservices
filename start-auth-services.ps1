# PowerShell script to start authentication-focused microservices
# Online Course Platform - Authentication Services Startup Script

Write-Host "🔐 Starting Authentication & Core Services" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

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

Write-Host "`n🔧 Starting services in order..." -ForegroundColor Yellow

# Start core services for authentication testing
Write-Host "`n1️⃣ Starting User Service (Authentication & OAuth2)..." -ForegroundColor Magenta
Start-Service -ServiceName "User Service" -ServicePath "user-service" -Port 8081 -DelaySeconds 35

Write-Host "`n2️⃣ Starting API Gateway (Main Entry Point)..." -ForegroundColor Magenta
Start-Service -ServiceName "API Gateway" -ServicePath "api-gateway" -Port 8080 -DelaySeconds 30

Write-Host "`n3️⃣ Starting Course Service (For Testing Role-Based Access)..." -ForegroundColor Magenta  
Start-Service -ServiceName "Course Service" -ServicePath "course-service" -Port 8082 -DelaySeconds 25

Write-Host "`n4️⃣ Starting Media Service (For Instructor Video Upload)..." -ForegroundColor Magenta
Start-Service -ServiceName "Media Service" -ServicePath "media-service" -Port 8085 -DelaySeconds 25

Write-Host "`n⏰ Waiting for all services to fully initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 40

Write-Host "`n🧪 Testing service connectivity..." -ForegroundColor Yellow

# Test services
$services = @(
    @{Name="User Service"; Port=8081; Endpoint="http://localhost:8081/user-service/actuator/health"},
    @{Name="API Gateway"; Port=8080; Endpoint="http://localhost:8080/actuator/health"},
    @{Name="Course Service"; Port=8082; Endpoint="http://localhost:8082/course-service/actuator/health"},
    @{Name="Media Service"; Port=8085; Endpoint="http://localhost:8085/media-service/actuator/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Endpoint -Method GET -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name): HEALTHY" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name): RESPONDING (Status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name): NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host "`n🎉 Authentication Services Startup Complete!" -ForegroundColor Green
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "  🔐 User Service:       http://localhost:8081/user-service" -ForegroundColor White
Write-Host "  🌐 API Gateway:        http://localhost:8080" -ForegroundColor White
Write-Host "  📚 Course Service:     http://localhost:8082/course-service" -ForegroundColor White
Write-Host "  📹 Media Service:      http://localhost:8085/media-service" -ForegroundColor White

Write-Host "`n📋 API Endpoints for Testing:" -ForegroundColor Yellow
Write-Host "  Registration:         POST http://localhost:8080/api/users/auth/register" -ForegroundColor White
Write-Host "  Login:                POST http://localhost:8080/api/users/auth/login" -ForegroundColor White
Write-Host "  Google OAuth2:        POST http://localhost:8080/api/users/auth/google" -ForegroundColor White
Write-Host "  User Management:      GET  http://localhost:8080/api/users/admin/users" -ForegroundColor White
Write-Host "  Course Management:    GET  http://localhost:8080/api/courses" -ForegroundColor White
Write-Host "  Media Upload:         POST http://localhost:8080/api/media/upload" -ForegroundColor White

Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Test authentication via frontend: http://localhost:3001" -ForegroundColor White
Write-Host "2. Test Google OAuth2 integration" -ForegroundColor White
Write-Host "3. Test role-based admin/instructor functionality" -ForegroundColor White
Write-Host "4. Test media upload for instructors" -ForegroundColor White

Write-Host "`n📖 Remember to:" -ForegroundColor Cyan
Write-Host "• Set your Google Client ID in the frontend .env file" -ForegroundColor White
Write-Host "• Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables for backend" -ForegroundColor White
