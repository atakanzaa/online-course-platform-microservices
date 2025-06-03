@echo off
echo Starting Online Course Platform Core Services
echo =============================================

cd /d "c:\Users\Yel\Desktop\online-course-platform"

echo.
echo Starting Course Service on port 8082...
cd course-service
start "Course Service" cmd /k "mvnw.cmd spring-boot:run -Dspring.profiles.active=dev"

timeout /t 5 /nobreak >nul

echo.
echo Starting Payment Service on port 8083...
cd ..\payment-service
start "Payment Service" cmd /k "mvnw.cmd spring-boot:run -Dspring.profiles.active=dev"

cd ..

echo.
echo Services are starting in separate windows...
echo Please wait 60-90 seconds for services to fully initialize
echo.
echo Service URLs:
echo Course Service:  http://localhost:8082/course-service/api/courses
echo Payment Service: http://localhost:8083/payment-service/api/payments
echo.
echo To test: Run test-integration.ps1 after services start
echo To stop: Close the command windows
pause
