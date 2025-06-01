#!/bin/bash

# List of services
services=(
    "config-server"
    "discovery-server"
    "api-gateway"
    "user-service"
    "course-service"
    "payment-service"
    "notification-service"
    "media-service"
    "analytics-service"
)

# Copy Dockerfile to each service directory
for service in "${services[@]}"
do
    cp Dockerfile.template "$service/Dockerfile"
    echo "Copied Dockerfile to $service"
done

echo "Completed copying Dockerfiles to all services"

docker-compose up -d rabbitmq 