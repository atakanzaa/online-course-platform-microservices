package payment_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.dto.PaymentRequest;
import payment_service.dto.PaymentResponse;
import payment_service.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable Long id) {
        return paymentService.getPayment(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByUser(@PathVariable Long userId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByUser(userId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByCourse(@PathVariable Long courseId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByCourse(courseId);
        return ResponseEntity.ok(payments);
    }
    
    @GetMapping("/check-purchase")
    public ResponseEntity<Boolean> checkCoursePurchase(
            @RequestParam Long userId,
            @RequestParam Long courseId) {
        boolean purchased = paymentService.isCoursePurchased(userId, courseId);
        return ResponseEntity.ok(purchased);
    }
}
