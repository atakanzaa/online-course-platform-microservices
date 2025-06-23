package notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import notification_service.event.PaymentSuccessEvent;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class PaymentEventConsumer {

    private final NotificationService notificationService;

    @PostMapping("/payment-success")
    public ResponseEntity<String> handlePaymentSuccessEvent(@RequestBody PaymentSuccessEvent event) {
        try {
            log.info("Received payment success event for payment: {}", event.getPaymentId());
            
            // Email bildirimi gönder
            String message = String.format(
                "Tebrikler! Ödemeniz başarıyla tamamlandı.\n\n" +
                "Ödeme ID: %s\n" +
                "Tutar: %.2f %s\n" +
                "Tarih: %s\n\n" +
                "Kursunuza artık erişebilirsiniz.",
                event.getPaymentId(),
                event.getAmount(),
                event.getCurrency(),
                event.getPaymentDate()
            );
            
            notificationService.sendPaymentSuccessNotification(
                event.getUserId(), 
                "Ödeme Başarılı", 
                message
            );
            
            log.info("Payment success notification sent for user: {}", event.getUserId());
            return ResponseEntity.ok("Notification sent successfully");
            
        } catch (Exception e) {
            log.error("Failed to process payment success event: {}", event.getPaymentId(), e);
            return ResponseEntity.internalServerError().body("Failed to send notification: " + e.getMessage());
        }
    }
}
