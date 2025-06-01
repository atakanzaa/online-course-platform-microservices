# Online Course Platform Microservices

A comprehensive microservices-based online course platform with İyzico payment integration, built with Spring Boot and Spring Cloud.

## ✨ Features

- **Complete Microservices Architecture**: 8 independent services with proper service discovery
- **İyzico Payment Integration**: Full 3DS support with test cards
- **Event-Driven Architecture**: Kafka for async messaging, RabbitMQ for notifications
- **Circuit Breaker Pattern**: Resilience4j for fault tolerance
- **Monitoring & Metrics**: Prometheus, Grafana, Spring Boot Actuator
- **Security**: JWT-based authentication and authorization
- **API Gateway**: Centralized routing and load balancing

## 🏗️ Architecture

### Microservices
- **Config Server** (8888): Centralized configuration management
- **Discovery Server** (8761): Eureka service discovery
- **API Gateway** (8080): Request routing and load balancing
- **User Service** (8081): Authentication, authorization, user management
- **Course Service** (8082): Course content, modules, lessons
- **Payment Service** (8083): İyzico payment processing with 3DS
- **Notification Service** (8084): Email, SMS, push notifications
- **Media Service** (8085): File upload/download, AWS S3 integration
- **Analytics Service** (8086): User behavior analytics

### Infrastructure
- **PostgreSQL**: Primary database (H2 for development)
- **Apache Kafka**: Event streaming and async messaging
- **RabbitMQ**: Message queues for notifications
- **Redis**: Caching and session management
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

## 🚀 Technologies

- **Backend**: Java 21, Spring Boot 3.2, Spring Cloud 2023.0.5
- **Database**: PostgreSQL, H2 (dev), JPA/Hibernate
- **Messaging**: Apache Kafka, RabbitMQ
- **Caching**: Redis
- **Security**: Spring Security, JWT
- **Monitoring**: Micrometer, Prometheus, Grafana
- **Payment**: İyzico API with HMAC-SHA256
- **Containerization**: Docker, Docker Compose
- **Build**: Maven

## 📋 Prerequisites

- **Java 21** or later
- **Maven 3.8+**
- **Docker & Docker Compose**
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/atakanzaa/online-course-platform-microservices.git
cd online-course-platform-microservices
```

### 2. Start Infrastructure Services
```bash
docker-compose up -d postgres rabbitmq kafka redis prometheus grafana
```

### 3. Build All Services
```bash
# Build all services
mvn clean package -DskipTests

# Or build individual services
cd course-service && mvn clean package -DskipTests
cd ../payment-service && mvn clean package -DskipTests
```

### 4. Start Microservices (In Order)
```bash
# 1. Config Server
cd config-server && mvn spring-boot:run

# 2. Discovery Server
cd discovery-server && mvn spring-boot:run

# 3. Core Services
cd course-service && mvn spring-boot:run
cd payment-service && mvn spring-boot:run
cd notification-service && mvn spring-boot:run

# 4. API Gateway
cd api-gateway && mvn spring-boot:run
```

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Config Server | http://localhost:8888 | Configuration management |
| Discovery Server | http://localhost:8761 | Service registry |
| API Gateway | http://localhost:8080 | Main entry point |
| User Service | http://localhost:8081 | Authentication |
| Course Service | http://localhost:8082 | Course management |
| Payment Service | http://localhost:8083 | İyzico payments |
| Notification Service | http://localhost:8084 | Notifications |
| Media Service | http://localhost:8085 | File management |
| Analytics Service | http://localhost:8086 | Analytics |

## 💳 İyzico Payment Testing

### Test Cards
```javascript
// Successful Payment
{
  "cardNumber": "5528790000000008",
  "expireMonth": "12",
  "expireYear": "2030",
  "cvc": "123"
}

// Failed Payment
{
  "cardNumber": "4111111111111129",
  "expireMonth": "12", 
  "expireYear": "2030",
  "cvc": "123"
}
```

### Sample Payment Request
```bash
curl -X POST http://localhost:8083/api/payments/course-purchase \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "userId": 1,
    "buyerName": "Test",
    "buyerSurname": "User",
    "buyerEmail": "test@example.com",
    "buyerPhone": "+905555555555",
    "buyerIdentityNumber": "11111111111",
    "buyerAddress": "Test Address",
    "buyerCity": "Istanbul",
    "buyerCountry": "Turkey",
    "buyerZipCode": "34000",
    "cardHolderName": "Test User",
    "cardNumber": "5528790000000008",
    "expireMonth": "12",
    "expireYear": "2030",
    "cvc": "123"
  }'
```

## 📊 Monitoring & Observability

### Prometheus Metrics
- **URL**: http://localhost:9090
- **Metrics**: Application metrics, JVM metrics, custom business metrics
- **Configuration**: `monitoring/prometheus.yml`

### Grafana Dashboards
- **URL**: http://localhost:3000
- **Default Login**: admin/admin
- **Dashboards**: JVM metrics, application performance, business metrics

### Health Checks
```bash
# Individual service health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health

# All services via API Gateway
curl http://localhost:8080/actuator/health
```

## 🔄 Event-Driven Architecture

### Kafka Topics
- `payment-success`: Payment completion events
- `course-enrollment`: Course enrollment events
- `user-activity`: User behavior analytics

### RabbitMQ Queues
- `email.queue`: Email notifications
- `sms.queue`: SMS notifications  
- `push.notification.queue`: Push notifications

### Event Flow Example
```
Payment Success → Kafka Event → Notification Service → Email/SMS
Course Purchase → Enrollment → Analytics → User Behavior Tracking
```

## ⚡ Circuit Breaker Pattern

Services implement circuit breaker pattern using Resilience4j:

```yaml
resilience4j:
  circuitbreaker:
    instances:
      course-service:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 60000
```

## 🔧 Development

### Project Structure
```
online-course-platform/
├── config-server/          # Configuration management
├── discovery-server/       # Service discovery
├── api-gateway/            # API Gateway
├── user-service/           # User management
├── course-service/         # Course management
├── payment-service/        # Payment processing
├── notification-service/   # Notifications
├── media-service/          # File management
├── analytics-service/      # Analytics
├── common-lib/             # Shared DTOs
├── monitoring/             # Prometheus config
└── docker-compose.yml      # Infrastructure
```

### Configuration Profiles
- **dev**: H2 database, embedded messaging
- **test**: Test configurations
- **prod**: PostgreSQL, external messaging

### Building Individual Services
```bash
cd payment-service
mvn clean package -DskipTests
mvn spring-boot:run -Dspring.profiles.active=dev
```

### Running Tests
```bash
# All tests
mvn test

# Specific service tests
cd payment-service && mvn test
```

## 🔐 Security

### JWT Authentication
```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use JWT token in requests
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:8082/api/courses
```

### API Security
- All endpoints require JWT tokens except auth endpoints
- Rate limiting on API Gateway
- CORS configuration for web clients

## 🐛 Troubleshooting

### Common Issues

1. **Service Discovery Issues**
   ```bash
   # Check Eureka dashboard
   curl http://localhost:8761
   ```

2. **Database Connection**
   ```bash
   # Check H2 console (dev profile)
   http://localhost:8082/h2-console
   ```

3. **Messaging Issues**
   ```bash
   # Check RabbitMQ management
   http://localhost:15672 (guest/guest)
   ```

4. **Payment Service Issues**
   ```bash
   # Check İyzico configuration
   curl http://localhost:8083/api/test/iyzico
   ```

## 📚 API Documentation

### Swagger UI (when available)
- Course Service: http://localhost:8082/swagger-ui.html
- Payment Service: http://localhost:8083/swagger-ui.html
- User Service: http://localhost:8081/swagger-ui.html

### Key Endpoints

#### Course Service
```bash
GET    /api/courses           # List all courses
POST   /api/courses           # Create course
GET    /api/courses/{id}      # Get course details
PUT    /api/courses/{id}      # Update course
DELETE /api/courses/{id}      # Delete course
```

#### Payment Service
```bash
POST   /api/payments/course-purchase    # Purchase course
GET    /api/payments/{id}               # Payment details
GET    /api/payments/user/{userId}      # User payments
POST   /api/payments/iyzico/3ds         # 3DS payment
```

#### User Service
```bash
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
GET    /api/users/profile     # User profile
PUT    /api/users/profile     # Update profile
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Atakan** - [@atakanzaa](https://github.com/atakanzaa)

## 🙏 Acknowledgments

- Spring Boot Team for excellent microservices framework
- İyzico for payment API documentation
- Netflix OSS for microservices patterns
- Spring Cloud Team for cloud-native tools