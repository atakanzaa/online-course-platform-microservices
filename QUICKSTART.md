# 🚀 Quick Start Guide

This guide will help you quickly start testing the Online Course Platform microservices.

## 📋 Prerequisites

- Java 21 or later
- Windows PowerShell or Command Prompt
- Git

## 🏁 Starting Core Services

1. **Clone the repository** (if you haven't already):

```bash
git clone https://github.com/atakanzaa/online-course-platform-microservices.git
cd online-course-platform-microservices
```

2. **Start core services** using one of the provided scripts:

```
# Option 1: Using batch file (recommended for Windows)
start-services.bat

# Option 2: Using PowerShell
.\quick-start.ps1
```

## 🔄 Testing the Microservices

1. **Wait for services to initialize** (60-90 seconds)

2. **Test course creation and payment**:

```
# Run the test script
.\test-course-payment.ps1
```

## 🔍 Service URLs

| Service | Development URL |
|---------|-----------------|
| Course Service | http://localhost:8082/course-service |
| Payment Service | http://localhost:8083/payment-service |
| H2 Console (Course) | http://localhost:8082/course-service/h2-console |
| H2 Console (Payment) | http://localhost:8083/payment-service/h2-console |

### API Endpoints

#### Course Service
- GET/POST courses: http://localhost:8082/course-service/api/courses
- GET specific course: http://localhost:8082/course-service/api/courses/{id}

#### Payment Service
- Process payment: http://localhost:8083/payment-service/api/payments
- 3DS payment: http://localhost:8083/payment-service/api/payments/course-purchase
- Check purchase: http://localhost:8083/payment-service/api/payments/check-purchase?userId={userId}&courseId={courseId}

## ⚙️ H2 Database Access

1. Open http://localhost:8082/course-service/h2-console
2. Configure:
   - JDBC URL: `jdbc:h2:mem:coursedb`
   - Username: `sa`
   - Password: `password`

## 🔧 Troubleshooting

1. **404 Not Found errors**:
   - Ensure you're using the correct context paths (/course-service, /payment-service)
   - Wait 60-90 seconds for services to fully initialize

2. **Connection issues**:
   - Verify services are running: `netstat -ano | findstr ":808"`
   - Check Java is installed: `java -version`

3. **Database issues**:
   - H2 console accessible at: http://localhost:8082/course-service/h2-console
   - Default credentials: sa / password

## 🧪 Integration Testing

For complete end-to-end testing:

```
# Start required infrastructure (if available)
docker-compose up -d

# Run comprehensive tests
.\test-integration.ps1
```
