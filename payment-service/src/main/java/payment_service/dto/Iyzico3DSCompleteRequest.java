package payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Iyzico3DSCompleteRequest {
    
    private String conversationId;
    private String locale;
    private String paymentId;
    private String paymentTransactionId;
}
