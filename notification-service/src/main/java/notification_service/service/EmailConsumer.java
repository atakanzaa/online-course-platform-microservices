package notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import notification_service.dto.NotificationMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailConsumer {

    @RabbitListener(queues = "email.queue")
    public void processEmailNotification(NotificationMessage message) {
        try {
            log.info("Processing email notification: {}", message.getId());
            
            // Gerçek email gönderimi burada yapılır
            // EmailService.sendEmail(message.getUserEmail(), message.getSubject(), message.getMessage());
            
            // Şimdilik sadece log atıyoruz
            log.info("=== EMAIL SENT ===");
            log.info("To User: {}", message.getUserId());
            log.info("Subject: {}", message.getSubject());
            log.info("Message: {}", message.getMessage());
            log.info("Template: {}", message.getTemplateName());
            log.info("==================");
            
            // Email gönderim başarılı
            log.info("Email notification sent successfully for user: {}", message.getUserId());
            
        } catch (Exception e) {
            log.error("Failed to send email notification for user: {}", message.getUserId(), e);
            // Dead letter queue'ya gönder veya retry mekanizması
            throw e;
        }
    }
}
