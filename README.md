# Online Course Platform

A microservices-based online course platform built with Spring Boot and Spring Cloud.

## Architecture

The platform consists of the following microservices:

- **Config Server**: Spring Cloud Config Server for centralized configuration
- **Discovery Server**: Eureka Server for service discovery
- **API Gateway**: Spring Cloud Gateway for routing and load balancing
- **User Service**: Handles user authentication and authorization
- **Course Service**: Manages course content and metadata
- **Payment Service**: Processes payments and integrates with payment gateways
- **Notification Service**: Sends notifications via RabbitMQ
- **Media Service**: Handles media upload/download using AWS S3
- **Analytics Service**: Processes user behavior data using Kafka

## Technologies

- Java 21
- Spring Boot 3.2
- Spring Cloud
- Docker & Docker Compose
- PostgreSQL
- RabbitMQ
- Apache Kafka
- Redis
- AWS S3

## Prerequisites

- Java 21
- Maven
- Docker & Docker Compose
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd online-course-platform
   ```

2. Build all services:
   ```bash
   ./mvnw clean package -DskipTests
   ```

3. Start the infrastructure services:
   ```bash
   docker-compose up -d postgres rabbitmq kafka redis
   ```

4. Start all services:
   ```bash
   docker-compose up -d
   ```

## Service URLs

- Config Server: http://localhost:8888
- Discovery Server: http://localhost:8761
- API Gateway: http://localhost:8080
- User Service: http://localhost:8081
- Course Service: http://localhost:8082
- Payment Service: http://localhost:8083
- Notification Service: http://localhost:8084
- Media Service: http://localhost:8085
- Analytics Service: http://localhost:8086

## API Documentation

Each service has its own Swagger UI documentation available at:
```
http://localhost:<service-port>/swagger-ui.html
```

## Monitoring

- Spring Boot Admin: http://localhost:8080/admin
- Eureka Dashboard: http://localhost:8761
- RabbitMQ Management: http://localhost:15672
- Kafka Manager: http://localhost:9000

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 