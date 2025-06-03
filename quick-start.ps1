# Simple service starter - starts core services for testing
# Online Course Platform - Quick Start

Write-Host "🚀 Quick Start - Core Services" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Yellow

Set-Location -Path "c:/Users/Yel/Desktop/online-course-platform"

Write-Host "`n📚 Starting Course Service..." -ForegroundColor Cyan
Set-Location -Path "course-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw.cmd spring-boot:run -Dspring.profiles.active=dev" -WindowStyle Normal
Write-Host "✅ Course Service starting in new window (Port 8082)" -ForegroundColor Green

Start-Sleep -Seconds 5

Write-Host "`n💳 Starting Payment Service..." -ForegroundColor Cyan
Set-Location -Path "../payment-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command", ".\mvnw.cmd spring-boot:run -Dspring.profiles.active=dev" -WindowStyle Normal
Write-Host "✅ Payment Service starting in new window (Port 8083)" -ForegroundColor Green

Set-Location -Path "../"

Write-Host "`n⏰ Services are starting..." -ForegroundColor Yellow
Write-Host "Please wait 60-90 seconds for services to fully initialize" -ForegroundColor Gray

Write-Host "`n🔗 Service URLs:" -ForegroundColor Cyan
Write-Host "Course Service:  http://localhost:8082/course-service/api/courses" -ForegroundColor White
Write-Host "Payment Service: http://localhost:8083/payment-service/api/payments" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for services to start (check console windows)" -ForegroundColor White
Write-Host "2. Run integration tests: .\test-integration.ps1" -ForegroundColor White
Write-Host "3. Test manually with Postman or curl" -ForegroundColor White

Write-Host "`n💡 To stop services: Close the PowerShell windows or press Ctrl+C in each" -ForegroundColor Blue
