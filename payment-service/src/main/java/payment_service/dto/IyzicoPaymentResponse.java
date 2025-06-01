package payment_service.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class IyzicoPaymentResponse {
    private String status;
    private String paymentId;
    private String conversationId;
    private String errorCode;
    private String errorMessage;
    private String errorGroup;
    private String locale;
    private Long systemTime;
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
    private String currency;
    private String paidPrice;
    private String price;
}
