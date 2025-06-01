# İyzico Payment Integration Test Guide

## Overview
This payment service integrates with İyzico payment gateway using direct REST API calls (no SDK dependency). The implementation includes proper HMAC-SHA256 authentication as required by İyzico API documentation.

## Setup Instructions

### 1. Get İyzico Sandbox Credentials
1. Go to [İyzico Developer Portal](https://dev.iyzipay.com/)
2. Create a developer account
3. Get your sandbox API Key and Secret Key
4. Update `application.properties`:
   ```properties
   iyzico.api-key=sandbox-YOUR-ACTUAL-API-KEY
   iyzico.secret-key=sandbox-YOUR-ACTUAL-SECRET-KEY
   ```

### 2. Authentication Implementation
The service implements İyzico's HMAC-SHA256 authentication:
- **Payload Format**: `randomKey + endpoint + jsonRequestBody`
- **Authorization String**: `apiKey:API_KEY&randomKey:RANDOM_KEY&signature:ENCRYPTED_DATA`
- **Header Format**: `IYZWSv2 BASE64_ENCODED_AUTHORIZATION`

## Test Endpoints

### 1. Test Payment
```bash
POST /api/payment/iyzico/test/payment
```
Creates a test payment using İyzico test card data.

### 2. Get Test Cards
```bash
GET /api/payment/iyzico/test/test-cards
```
Returns İyzico test card numbers for various scenarios.

### 3. Authentication Test
```bash
GET /api/payment/iyzico/test/auth-test
```
Tests the authentication mechanism.

### 4. Health Check
```bash
GET /api/payment/iyzico/test/health
```
Service health status.

## İyzico Test Cards

### Successful Payment Cards
- **Visa**: `4543600299100712`
- **Mastercard**: `5528790000000008`  
- **American Express**: `374427427427427`

### Failed Payment Cards
- **Insufficient Funds**: `4157920000000015`
- **Do Not Honor**: `4624748200000003`
- **Expired Card**: `4543600000000017`

### Test Data
- **Expire Month**: `12`
- **Expire Year**: `2030`
- **CVC**: `123`
- **Cardholder Name**: `John Doe`

## Testing Steps

### 1. Start the Service
```bash
cd payment-service
mvn spring-boot:run
```

### 2. Test with Curl

#### Get Test Cards
```bash
curl -X GET http://localhost:8083/api/payment/iyzico/test/test-cards
```

#### Test Payment (Default Test Data)
```bash
curl -X POST http://localhost:8083/api/payment/iyzico/test/payment \
  -H "Content-Type: application/json"
```

#### Test Payment (Custom Data)
```bash
curl -X POST http://localhost:8083/api/payment/iyzico/test/payment \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "amount": 29.90,
    "currency": "TRY",
    "courseId": 1,
    "userId": 1,
    "cardHolderName": "John Doe",
    "cardNumber": "4543600299100712",
    "expireMonth": "12",
    "expireYear": "2030",
    "cvc": "123",
    "buyerName": "John",
    "buyerSurname": "Doe",
    "buyerEmail": "john@test.com",
    "buyerPhone": "+905551234567",
    "buyerIdentityNumber": "11111111116",
    "buyerAddress": "Test Address",
    "buyerCity": "Istanbul",
    "buyerCountry": "Turkey",
    "buyerZipCode": "34000"
  }'
```

### 3. Expected Responses

#### Successful Payment
```json
{
  "status": "success",
  "paymentId": "12345678",
  "conversationId": "test-123",
  "paymentStatus": "SUCCESS",
  "fraudStatus": "1",
  "currency": "TRY",
  "paidPrice": "29.90",
  "price": "29.90"
}
```

#### Failed Payment
```json
{
  "status": "failure",
  "errorCode": "5001",
  "errorMessage": "Yetersiz bakiye",
  "conversationId": "test-123"
}
```

## Architecture

### Service Structure
```
payment-service/
├── src/main/java/payment_service/
│   ├── controller/
│   │   ├── PaymentController.java
│   │   └── IyzicoTestController.java
│   ├── service/
│   │   ├── PaymentService.java
│   │   └── IyzicoApiService.java
│   ├── dto/
│   │   ├── IyzicoPaymentRequest.java
│   │   └── IyzicoPaymentResponse.java
│   ├── entity/
│   │   ├── Payment.java
│   │   └── PaymentStatus.java
│   ├── config/
│   │   └── IyzicoConfig.java
│   └── repository/
│       └── PaymentRepository.java
```

### Authentication Flow
1. Generate random key (timestamp + suffix)
2. Create JSON request body
3. Build payload: `randomKey + endpoint + jsonBody`
4. Encrypt payload with HMAC-SHA256 using secret key
5. Create authorization string with API key, random key, and signature
6. Base64 encode authorization string
7. Add "IYZWSv2" prefix to create final header

## Integration with Course Service

The payment service can be integrated with the course service through:

1. **REST API calls** between services
2. **Event-driven communication** (future enhancement)
3. **API Gateway routing** (future enhancement)

### Sample Integration Flow
1. User selects course in course-service
2. Course-service calls payment-service with course details
3. Payment-service creates İyzico payment request
4. User completes payment
5. Payment-service notifies course-service of payment status

## Security Notes

- ⚠️ **This is for testing only** - not production ready
- API keys are in plain text in application.properties
- No input validation implemented yet
- No rate limiting implemented
- No fraud detection beyond İyzico's built-in checks

## Next Steps

1. **Test the integration** with your İyzico sandbox credentials
2. **Implement proper error handling** for production scenarios  
3. **Add input validation** and security measures
4. **Create integration tests** with mock responses
5. **Implement event publishing** for payment status changes
6. **Add monitoring and logging** for production use

## Troubleshooting

### Common Issues
1. **Authentication Error**: Check API key and secret key in application.properties
2. **Invalid Card**: Use only İyzico test card numbers
3. **Connection Error**: Verify sandbox URL is accessible
4. **Parsing Error**: Check JSON request format matches İyzico requirements

### Debug Mode
Enable debug logging in application.properties:
```properties
logging.level.payment_service=DEBUG
logging.level.org.springframework.web.client.RestTemplate=DEBUG
```
