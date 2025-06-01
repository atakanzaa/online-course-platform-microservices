package payment_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.dto.PaymentRequest;
import payment_service.dto.PaymentResponse;
import payment_service.service.PaymentService;
import payment_service.util.IyzicoTestUtil;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/payment")
    public ResponseEntity<PaymentResponse> testPayment() {
        // Test için hazır veri ile ödeme testi
        PaymentRequest testRequest = IyzicoTestUtil.createTestPaymentRequest();
        PaymentResponse response = paymentService.processPayment(testRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/payment/custom")
    public ResponseEntity<PaymentResponse> testCustomPayment(@RequestBody PaymentRequest request) {
        // Özel test verisi ile ödeme testi
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment Service is running with İyzico integration!");
    }
}
