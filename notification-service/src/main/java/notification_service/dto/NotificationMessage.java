package notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {
    private String id;
    private String userId;
    private String userEmail;
    private String userPhone;
    private String subject;
    private String message;
    private NotificationType type;
    private LocalDateTime createdAt;
    private String templateName;
    private Object templateData;
}

enum NotificationType {
    EMAIL, SMS, PUSH_NOTIFICATION
}
