package payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursePurchaseResponse {
    
    private boolean success;
    private String message;
    private String status; // SUCCESS, FAILURE, REQUIRES_3DS
    
    // Payment bilgileri
    private Long paymentId;
    private String transactionId;
    private BigDecimal amount;
    
    // Course bilgileri
    private Long courseId;
    private String courseName;
    
    // 3DS bilgileri (eğer 3DS gerekiyorsa)
    private String threeDSHtmlContent;
    private String callbackUrl;
    
    // Hata bilgileri
    private String errorCode;
    private String errorMessage;
    
    // Enrollment bilgileri
    private boolean enrolled;
    private String enrollmentStatus;
    
    // İyzico response bilgileri
    private String paymentStatus;
    private String fraudStatus;
    private String cardType;
    private String cardAssociation;
    private String lastFourDigits;
}
