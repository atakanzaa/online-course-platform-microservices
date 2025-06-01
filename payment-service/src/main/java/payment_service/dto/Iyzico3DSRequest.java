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
public class Iyzico3DSRequest {
    
    // Ana ödeme bilgileri
    private String conversationId;
    private BigDecimal price;
    private BigDecimal paidPrice;
    private String currency;
    private Integer installment;
    private String basketId;
    private String paymentGroup;
    private String paymentChannel;
    private String callbackUrl;
    
    // Kart bilgileri
    private String cardHolderName;
    private String cardNumber;
    private String expireMonth;
    private String expireYear;
    private String cvc;
    private Integer registerCard;
    private String cardAlias;
    
    // Alıcı bilgileri (Buyer)
    private String buyerId;
    private String buyerName;
    private String buyerSurname;
    private String buyerEmail;
    private String buyerPhone;
    private String buyerIdentityNumber;
    private String buyerRegistrationAddress;
    private String buyerIp;
    private String buyerCity;
    private String buyerCountry;
    private String buyerZipCode;
    private String buyerLastLoginDate;
    private String buyerRegistrationDate;
    
    // Fatura adresi (BillingAddress)
    private String billingContactName;
    private String billingCity;
    private String billingCountry;
    private String billingAddress;
    private String billingZipCode;
    
    // Teslimat adresi (ShippingAddress)
    private String shippingContactName;
    private String shippingCity;
    private String shippingCountry;
    private String shippingAddress;
    private String shippingZipCode;
    
    // Sepet öğeleri bilgileri
    private Long courseId;
    private String courseName;
    private String courseCategory1;
    private String courseCategory2;
    private String itemType; // VIRTUAL, PHYSICAL
    
    // Ek bilgiler
    private String locale;
    private String paymentSource;
}
