package payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoursePurchaseRequest {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    // Kart bilgileri
    @NotNull(message = "Card holder name is required")
    private String cardHolderName;
    
    @NotNull(message = "Card number is required")
    private String cardNumber;
    
    @NotNull(message = "Expire month is required")
    private String expireMonth;
    
    @NotNull(message = "Expire year is required")
    private String expireYear;
    
    @NotNull(message = "CVC is required")
    private String cvc;
    
    // Alıcı bilgileri
    @NotNull(message = "Buyer name is required")
    private String buyerName;
    
    @NotNull(message = "Buyer surname is required")
    private String buyerSurname;
    
    @NotNull(message = "Buyer email is required")
    private String buyerEmail;
    
    @NotNull(message = "Buyer phone is required")
    private String buyerPhone;
    
    @NotNull(message = "Buyer identity number is required")
    private String buyerIdentityNumber;
    
    // Adres bilgileri
    @NotNull(message = "Buyer address is required")
    private String buyerAddress;
    
    @NotNull(message = "Buyer city is required")
    private String buyerCity;
    
    @NotNull(message = "Buyer country is required")
    private String buyerCountry;
    
    private String buyerZipCode;
    
    // Ödeme tipi
    @Builder.Default
    private String paymentType = "DIRECT"; // DIRECT, 3DS
    
    // 3DS için callback URL
    private String callbackUrl;
}
