package payment_service.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class IyzicoPaymentRequest {
    private Long userId;
    private Long courseId;
    private BigDecimal amount;
    private String currency;
    
    // Kullanıcı bilgileri
    private String buyerName;
    private String buyerSurname;
    private String buyerEmail;
    private String buyerPhone;
    private String buyerIdentityNumber;
    
    // Adres bilgileri
    private String buyerAddress;
    private String buyerCity;
    private String buyerCountry;
    private String buyerZipCode;
    
    // Kart bilgileri
    private String cardHolderName;
    private String cardNumber;
    private String expireMonth;
    private String expireYear;
    private String cvc;
    
    // Opsiyonel
    private String callbackUrl;
    private String conversationId;
}
