#!/bin/bash

# Online Course Platform - Quick Test Script
# This script tests the basic functionality of the microservices

echo "🚀 Starting Online Course Platform Test Suite"
echo "=============================================="

# Test course-service
echo "📚 Testing Course Service..."
COURSE_RESPONSE=$(curl -s http://localhost:8082/api/courses 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Course Service: HEALTHY"
else
    echo "❌ Course Service: NOT RESPONDING"
fi

# Test payment-service
echo "💳 Testing Payment Service..."
PAYMENT_RESPONSE=$(curl -s http://localhost:8083/api/test/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Payment Service: HEALTHY"
else
    echo "❌ Payment Service: NOT RESPONDING"
fi

# Test notification-service
echo "📧 Testing Notification Service..."
NOTIFICATION_RESPONSE=$(curl -s http://localhost:8084/actuator/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Notification Service: HEALTHY"
else
    echo "❌ Notification Service: NOT RESPONDING"
fi

echo ""
echo "🧪 Running Integration Tests..."
echo "================================"

# Test course creation
echo "1. Creating a test course..."
COURSE_JSON='{
  "title": "Test Course",
  "description": "A test course for microservices",
  "price": 99.99,
  "published": true,
  "modules": [
    {
      "title": "Module 1",
      "orderIndex": 1,
      "lessons": [
        {
          "title": "Lesson 1",
          "content": "Introduction to microservices",
          "orderIndex": 1
        }
      ]
    }
  ]
}'

COURSE_ID=$(curl -s -X POST http://localhost:8082/api/courses \
  -H "Content-Type: application/json" \
  -d "$COURSE_JSON" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$COURSE_ID" ]; then
    echo "✅ Course created successfully with ID: $COURSE_ID"
else
    echo "❌ Failed to create course"
fi

# Test payment processing
echo "2. Testing payment flow..."
PAYMENT_JSON='{
  "courseId": '$COURSE_ID',
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

PAYMENT_RESULT=$(curl -s -X POST http://localhost:8083/api/payments/course-purchase \
  -H "Content-Type: application/json" \
  -d "$PAYMENT_JSON")

if echo "$PAYMENT_RESULT" | grep -q "SUCCESS"; then
    echo "✅ Payment processed successfully"
    echo "✅ Kafka event should be published"
    echo "✅ Notification should be sent"
else
    echo "❌ Payment processing failed"
    echo "Response: $PAYMENT_RESULT"
fi

echo ""
echo "📊 Service Status Summary"
echo "========================"
echo "Course Service (8082): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/courses)"
echo "Payment Service (8083): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/actuator/health)"
echo "Notification Service (8084): $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8084/actuator/health)"

echo ""
echo "🎉 Test Suite Completed!"
echo "========================"
echo "📝 Check logs for detailed information"
echo "🔍 Monitor Kafka topics for events"
echo "📧 Check notification logs for email/SMS"
