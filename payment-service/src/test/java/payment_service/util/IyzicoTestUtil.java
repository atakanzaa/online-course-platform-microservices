package payment_service.util;

import payment_service.dto.IyzicoPaymentRequest;
import payment_service.dto.PaymentRequest;

import java.math.BigDecimal;

public class IyzicoTestUtil {
    
    // İyzico test kartı bilgileri (resmi test kartları)
    public static final String TEST_CARD_NUMBER = "5528790000000008";
    public static final String TEST_CARD_HOLDER = "Test User";
    public static final String TEST_CARD_EXPIRE_MONTH = "12";
    public static final String TEST_CARD_EXPIRE_YEAR = "2030";
    public static final String TEST_CARD_CVC = "123";
    
    // Test kullanıcı bilgileri
    public static final String TEST_BUYER_NAME = "Test";
    public static final String TEST_BUYER_SURNAME = "User";
    public static final String TEST_BUYER_EMAIL = "test@example.com";
    public static final String TEST_BUYER_PHONE = "+905555555555";
    public static final String TEST_BUYER_IDENTITY = "11111111111";
    public static final String TEST_BUYER_ADDRESS = "Test Address";
    public static final String TEST_BUYER_CITY = "Istanbul";
    public static final String TEST_BUYER_COUNTRY = "Turkey";
    public static final String TEST_BUYER_ZIP = "34000";
    
    public static PaymentRequest createTestPaymentRequest() {
        return PaymentRequest.builder()
                .userId(1L)
                .courseId(1L)
                .amount(new BigDecimal("99.99"))
                .paymentMethod("IYZICO")
                .buyerName(TEST_BUYER_NAME)
                .buyerSurname(TEST_BUYER_SURNAME)
                .buyerEmail(TEST_BUYER_EMAIL)
                .buyerPhone(TEST_BUYER_PHONE)
                .buyerIdentityNumber(TEST_BUYER_IDENTITY)
                .buyerAddress(TEST_BUYER_ADDRESS)
                .buyerCity(TEST_BUYER_CITY)
                .buyerCountry(TEST_BUYER_COUNTRY)
                .buyerZipCode(TEST_BUYER_ZIP)
                .cardHolderName(TEST_CARD_HOLDER)
                .cardNumber(TEST_CARD_NUMBER)
                .expireMonth(TEST_CARD_EXPIRE_MONTH)
                .expireYear(TEST_CARD_EXPIRE_YEAR)
                .cvc(TEST_CARD_CVC)
                .build();
    }
    
    public static IyzicoPaymentRequest createTestIyzicoRequest() {
        return IyzicoPaymentRequest.builder()
                .userId(1L)
                .courseId(1L)
                .amount(new BigDecimal("99.99"))
                .currency("TRY")
                .buyerName(TEST_BUYER_NAME)
                .buyerSurname(TEST_BUYER_SURNAME)
                .buyerEmail(TEST_BUYER_EMAIL)
                .buyerPhone(TEST_BUYER_PHONE)
                .buyerIdentityNumber(TEST_BUYER_IDENTITY)
                .buyerAddress(TEST_BUYER_ADDRESS)
                .buyerCity(TEST_BUYER_CITY)
                .buyerCountry(TEST_BUYER_COUNTRY)
                .buyerZipCode(TEST_BUYER_ZIP)
                .cardHolderName(TEST_CARD_HOLDER)
                .cardNumber(TEST_CARD_NUMBER)
                .expireMonth(TEST_CARD_EXPIRE_MONTH)
                .expireYear(TEST_CARD_EXPIRE_YEAR)
                .cvc(TEST_CARD_CVC)
                .conversationId("TEST_CONV_123")
                .build();
    }
}
