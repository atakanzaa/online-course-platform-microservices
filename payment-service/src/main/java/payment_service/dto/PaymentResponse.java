package payment_service.dto;

import lombok.Data;
import lombok.Builder;
import payment_service.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long id;
    private Long userId;
    private Long courseId;
    private BigDecimal amount;
    private PaymentStatus status;
    private String provider;
    private String transactionId;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
