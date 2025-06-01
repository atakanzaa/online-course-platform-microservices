package payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Iyzico3DSResponse {
    
    // Ana yanıt bilgileri
    private String status;
    private String errorCode;
    private String errorMessage;
    private String errorGroup;
    private String locale;
    private Long systemTime;
    private String conversationId;
    
    // 3DS özel bilgileri
    private String threeDSHtmlContent;
    private String paymentId;
    private String paymentTransactionId;
    
    // Ek bilgiler (başarılı işlemler için)
    private String paymentStatus;
    private String fraudStatus;
    private String merchantCommissionRate;
    private String merchantCommissionRateAmount;
    private String iyziCommissionRateAmount;
    private String iyziCommissionFee;
    private String cardType;
    private String cardAssociation;
    private String cardFamily;
    private String cardToken;
    private String cardUserKey;
    private String binNumber;
    private String lastFourDigits;
    private String basketId;
    private String currency;    private String itemTransactions;
    private String callbackUrl;
    
    /**
     * Alias for threeDSHtmlContent field to match the interface used in CoursePurchaseService
     */
    public String getHtmlContent() {
        return this.threeDSHtmlContent;
    }
}
