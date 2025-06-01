package payment_service.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@Builder
public class PaymentRequest {
    private Long userId;
    private Long courseId;
    private BigDecimal amount;
    private String paymentMethod; // IYZICO, STRIPE, etc.
    
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
    
    // Kart bilgileri (sadece test için)
    private String cardHolderName;
    private String cardNumber;
    private String expireMonth;
    private String expireYear;
    private String cvc;
}
