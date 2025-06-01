package payment_service.util;

import payment_service.dto.IyzicoPaymentRequest;
import payment_service.dto.PaymentRequest;
import payment_service.dto.Iyzico3DSRequest;
import payment_service.dto.Iyzico3DSCompleteRequest;

import java.math.BigDecimal;

public class IyzicoTestUtil {
    
    // İyzico test kartı bilgileri (resmi test kartları)
    public static final String TEST_CARD_NUMBER = "5528790000000008";
    public static final String TEST_CARD_HOLDER = "Test User";
    public static final String TEST_CARD_EXPIRE_MONTH = "12";
    public static final String TEST_CARD_EXPIRE_YEAR = "30";
    public static final String TEST_CARD_CVC = "123";
    
    // 3DS Test kartları
    public static final String TEST_3DS_SUCCESS_MASTERCARD = "5528790000000008"; // 3DS başarılı
    public static final String TEST_3DS_FAIL_MASTERCARD = "5401341234567891";    // 3DS başarısız
    public static final String TEST_3DS_SUCCESS_VISA = "4766620000000001";       // 3DS başarılı
    public static final String TEST_3DS_FAIL_VISA = "4603450000000000";          // 3DS başarısız
    
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
    
    /**
     * Test amaçlı 3DS ödeme isteği oluşturur
     */
    public static Iyzico3DSRequest createSample3DSRequest() {
        String conversationId = "3DS_CONV_" + System.currentTimeMillis();
        String basketId = "3DS_BASKET_" + System.currentTimeMillis();
        
        return Iyzico3DSRequest.builder()
                .conversationId(conversationId)
                .price(new BigDecimal("199.99"))
                .paidPrice(new BigDecimal("199.99"))
                .basketId(basketId)
                .callbackUrl("http://localhost:8083/api/payment/iyzico/3ds/callback")
                .cardHolderName(TEST_CARD_HOLDER)
                .cardNumber(TEST_3DS_SUCCESS_MASTERCARD)
                .expireMonth(TEST_CARD_EXPIRE_MONTH)
                .expireYear(TEST_CARD_EXPIRE_YEAR)
                .cvc(TEST_CARD_CVC)
                .buyerId("BUYER_" + System.currentTimeMillis())
                .buyerName(TEST_BUYER_NAME)
                .buyerSurname(TEST_BUYER_SURNAME)
                .buyerPhone(TEST_BUYER_PHONE)
                .buyerEmail(TEST_BUYER_EMAIL)
                .buyerIdentityNumber(TEST_BUYER_IDENTITY)
                .buyerRegistrationAddress(TEST_BUYER_ADDRESS)                .buyerCity(TEST_BUYER_CITY)
                .courseId(123L)
                .courseName("Java Spring Boot Kursu")
                .build();
    }
    
    /**
     * 3DS başarısız test kartı ile ödeme isteği oluşturur
     */
    public static Iyzico3DSRequest createFailSample3DSRequest() {
        Iyzico3DSRequest request = createSample3DSRequest();
        request.setCardNumber(TEST_3DS_FAIL_MASTERCARD);
        request.setConversationId("3DS_FAIL_CONV_" + System.currentTimeMillis());
        return request;
    }
    
    /**
     * Visa test kartı ile 3DS ödeme isteği oluşturur
     */
    public static Iyzico3DSRequest createVisa3DSRequest() {
        Iyzico3DSRequest request = createSample3DSRequest();
        request.setCardNumber(TEST_3DS_SUCCESS_VISA);
        request.setConversationId("3DS_VISA_CONV_" + System.currentTimeMillis());
        return request;
    }
    
    /**
     * 3DS tamamlama isteği oluşturur
     */
    public static Iyzico3DSCompleteRequest create3DSCompleteRequest(String paymentId, String conversationId) {
        return Iyzico3DSCompleteRequest.builder()
                .conversationId(conversationId)
                .paymentId(paymentId)
                .build();
    }
    
    /**
     * Özel parametrelerle 3DS isteği oluşturur
     */
    public static Iyzico3DSRequest createCustom3DSRequest(String cardNumber, BigDecimal amount, String courseName) {
        String conversationId = "CUSTOM_3DS_CONV_" + System.currentTimeMillis();
        String basketId = "CUSTOM_3DS_BASKET_" + System.currentTimeMillis();
        
        return Iyzico3DSRequest.builder()
                .conversationId(conversationId)
                .price(amount)
                .paidPrice(amount)
                .basketId(basketId)
                .callbackUrl("http://localhost:8083/api/payment/iyzico/3ds/callback")
                .cardHolderName(TEST_CARD_HOLDER)
                .cardNumber(cardNumber)
                .expireMonth(TEST_CARD_EXPIRE_MONTH)
                .expireYear(TEST_CARD_EXPIRE_YEAR)
                .cvc(TEST_CARD_CVC)
                .buyerId("BUYER_" + System.currentTimeMillis())
                .buyerName(TEST_BUYER_NAME)
                .buyerSurname(TEST_BUYER_SURNAME)
                .buyerPhone(TEST_BUYER_PHONE)
                .buyerEmail(TEST_BUYER_EMAIL)
                .buyerIdentityNumber(TEST_BUYER_IDENTITY)
                .buyerRegistrationAddress(TEST_BUYER_ADDRESS)                .buyerCity(TEST_BUYER_CITY)
                .courseId(System.currentTimeMillis())
                .courseName(courseName)
                .build();
    }
    
    /**
     * Tüm 3DS test kartlarının listesi
     */
    public static String[] getAllTest3DSCards() {
        return new String[]{
                TEST_3DS_SUCCESS_MASTERCARD,
                TEST_3DS_FAIL_MASTERCARD,
                TEST_3DS_SUCCESS_VISA,
                TEST_3DS_FAIL_VISA
        };
    }
    
    /**
     * Test kartının açıklamasını döner
     */
    public static String getCardDescription(String cardNumber) {
        return switch (cardNumber) {
            case TEST_3DS_SUCCESS_MASTERCARD -> "MasterCard Test (3DS Başarılı)";
            case TEST_3DS_FAIL_MASTERCARD -> "MasterCard Test (3DS Başarısız)";
            case TEST_3DS_SUCCESS_VISA -> "Visa Test (3DS Başarılı)";
            case TEST_3DS_FAIL_VISA -> "Visa Test (3DS Başarısız)";
            default -> "Bilinmeyen Test Kartı";
        };
    }
}
