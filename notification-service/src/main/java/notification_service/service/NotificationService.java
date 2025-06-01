package notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import notification_service.config.RabbitMQConfig;
import notification_service.dto.NotificationMessage;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final RabbitTemplate rabbitTemplate;    public void sendPaymentSuccessNotification(String userId, String subject, String message) {
        try {
            // Console log
            log.info("=== PAYMENT SUCCESS NOTIFICATION ===");
            log.info("User ID: {}", userId);
            log.info("Subject: {}", subject);
            log.info("Message: {}", message);
            log.info("=====================================");
            
            // RabbitMQ ile email queue'ya gönder
            NotificationMessage emailNotification = NotificationMessage.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .subject(subject)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .templateName("payment_success")
                    .build();
            
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                "notification.email.payment",
                emailNotification
            );
            
            log.info("Payment success notification sent to email queue for user: {}", userId);
            
        } catch (Exception e) {
            log.error("Failed to send payment success notification for user: {}", userId, e);
            throw e;
        }
    }
    
    public void sendCourseEnrollmentNotification(String userId, String courseTitle) {
        try {
            String message = String.format(
                "Tebrikler! %s kursuna başarıyla kaydoldunuz. İyi öğrenmeler!",
                courseTitle
            );
            
            log.info("=== COURSE ENROLLMENT NOTIFICATION ===");
            log.info("User ID: {}", userId);
            log.info("Subject: Kursa Kayıt Başarılı");
            log.info("Message: {}", message);
            log.info("======================================");
            
        } catch (Exception e) {
            log.error("Failed to send course enrollment notification for user: {}", userId, e);
            throw e;
        }
    }
}
