package payment_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.dto.IyzicoPaymentRequest;
import payment_service.dto.IyzicoPaymentResponse;
import payment_service.service.IyzicoApiService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/iyzico/test")
@RequiredArgsConstructor
@Slf4j
public class IyzicoTestController {
    
    private final IyzicoApiService iyzicoApiService;
    
    /**
     * Test İyzico payment with valid test card data
     */
    @PostMapping("/payment")
    public ResponseEntity<IyzicoPaymentResponse> testPayment(@RequestBody(required = false) IyzicoPaymentRequest request) {
        
        // Use provided request or create test data
        if (request == null) {
            request = createTestPaymentRequest();
        }
        
        log.info("Testing İyzico payment with request: {}", request);
        
        IyzicoPaymentResponse response = iyzicoApiService.createPayment(request);
        
        log.info("İyzico payment response: {}", response);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get İyzico test card data for testing
     */
    @GetMapping("/test-cards")
    public ResponseEntity<Map<String, Object>> getTestCards() {
        Map<String, Object> testData = new HashMap<>();
        
        // Successful payment test cards
        Map<String, Object> successCards = new HashMap<>();
        successCards.put("visa", "4543600299100712");
        successCards.put("mastercard", "5528790000000008");
        successCards.put("american_express", "374427427427427");
        
        // Failed payment test cards
        Map<String, Object> failCards = new HashMap<>();
        failCards.put("insufficient_funds", "4157920000000015");
        failCards.put("do_not_honor", "4624748200000003");
        failCards.put("expired_card", "4543600000000017");
        
        testData.put("success_cards", successCards);
        testData.put("fail_cards", failCards);
        testData.put("test_expire_month", "12");
        testData.put("test_expire_year", "2030");
        testData.put("test_cvc", "123");
        testData.put("test_holder_name", "John Doe");
        
        return ResponseEntity.ok(testData);
    }
    
    /**
     * Create a complete test payment request with İyzico test data
     */
    private IyzicoPaymentRequest createTestPaymentRequest() {
        return IyzicoPaymentRequest.builder()
                .conversationId("test-conv-" + System.currentTimeMillis())
                .amount(new BigDecimal("99.90"))
                .currency("TRY")
                .courseId(1L)
                .userId(1L)
                
                // Test card data (successful Visa)
                .cardHolderName("John Doe")
                .cardNumber("4543600299100712")
                .expireMonth("12")
                .expireYear("2030")
                .cvc("123")
                
                // Buyer information
                .buyerName("John")
                .buyerSurname("Doe")
                .buyerEmail("john.doe@test.com")
                .buyerPhone("+905551234567")
                .buyerIdentityNumber("11111111116")
                .buyerAddress("Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1")
                .buyerCity("Istanbul")
                .buyerCountry("Turkey")
                .buyerZipCode("34732")
                .build();
    }
    
    /**
     * Test authentication header generation
     */
    @GetMapping("/auth-test")
    public ResponseEntity<Map<String, String>> testAuthGeneration() {
        Map<String, String> authTest = new HashMap<>();
        
        try {
            IyzicoPaymentRequest testRequest = createTestPaymentRequest();
            IyzicoPaymentResponse response = iyzicoApiService.createPayment(testRequest);
            
            authTest.put("status", "success");
            authTest.put("message", "Authentication test completed");
            authTest.put("response_status", response.getStatus());
            authTest.put("conversation_id", response.getConversationId());
            
        } catch (Exception e) {
            authTest.put("status", "error");
            authTest.put("message", "Authentication test failed");
            authTest.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(authTest);
    }
    
    /**
     * Health check for İyzico service
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> health = new HashMap<>();
        health.put("service", "iyzico-payment");
        health.put("status", "ready");
        health.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(health);
    }
}
