package payment_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.dto.Iyzico3DSRequest;
import payment_service.dto.Iyzico3DSResponse;
import payment_service.dto.Iyzico3DSCompleteRequest;
import payment_service.dto.IyzicoPaymentResponse;
import payment_service.service.IyzicoApiService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/iyzico/3ds")
@RequiredArgsConstructor
@Slf4j
public class Iyzico3DSController {
    
    private final IyzicoApiService iyzicoApiService;
    
    /**
     * 3DS ödeme işlemini başlatır
     */
    @PostMapping("/initialize")
    public ResponseEntity<Iyzico3DSResponse> initialize3DSPayment(
            @RequestBody(required = false) Iyzico3DSRequest request) {
        
        // Eğer request boşsa test verisi kullan
        if (request == null) {
            request = createTest3DSRequest();
        }
        
        // callbackUrl yoksa varsayılan ayarla
        if (request.getCallbackUrl() == null) {
            request.setCallbackUrl("http://localhost:8083/api/payment/iyzico/3ds/callback");
        }
        
        log.info("3DS ödeme başlatılıyor: {}", request.getConversationId());
        
        Iyzico3DSResponse response = iyzicoApiService.initialize3DSPayment(request);
        
        log.info("3DS yanıt durumu: {}", response.getStatus());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 3DS doğrulama tamamlandıktan sonra ödemeyi sonlandırır
     */
    @PostMapping("/complete")
    public ResponseEntity<IyzicoPaymentResponse> complete3DSPayment(
            @RequestBody Iyzico3DSCompleteRequest request) {
        
        log.info("3DS ödeme tamamlanıyor: {}", request.getConversationId());
        
        IyzicoPaymentResponse response = iyzicoApiService.complete3DSPayment(request);
        
        log.info("3DS tamamlama yanıt durumu: {}", response.getStatus());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 3DS callback URL - İyzico'dan gelen yanıtları işler
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, String>> handle3DSCallback(
            @RequestParam Map<String, String> params,
            @RequestBody(required = false) String rawBody) {
        
        log.info("3DS callback alındı: {}", params);
        log.debug("3DS callback body: {}", rawBody);
        
        Map<String, String> response = new HashMap<>();
        
        // Callback parametrelerini işle
        String status = params.get("status");
        String paymentId = params.get("paymentId");
        String conversationId = params.get("conversationId");
        
        if ("success".equals(status) && paymentId != null) {
            // Başarılı 3DS doğrulaması - ödemeyi tamamla
            Iyzico3DSCompleteRequest completeRequest = Iyzico3DSCompleteRequest.builder()
                    .conversationId(conversationId)
                    .paymentId(paymentId)
                    .locale("tr")
                    .build();
            
            IyzicoPaymentResponse paymentResult = iyzicoApiService.complete3DSPayment(completeRequest);
            
            response.put("status", "success");
            response.put("message", "3DS doğrulaması başarılı, ödeme tamamlandı");
            response.put("paymentStatus", paymentResult.getStatus());
            response.put("paymentId", paymentResult.getPaymentId());
            
        } else {
            response.put("status", "failure");
            response.put("message", "3DS doğrulaması başarısız");
            response.put("error", params.get("errorMessage"));
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Test için 3DS HTML sayfasını görüntüler
     */
    @GetMapping("/test-page")
    public ResponseEntity<String> getTestPage() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>İyzico 3DS Test</title>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .form-group { margin-bottom: 15px; }
                    label { display: block; margin-bottom: 5px; font-weight: bold; }
                    input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                    button { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                    .result { margin-top: 20px; padding: 10px; border-radius: 4px; }
                    .success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                    .error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>İyzico 3DS Test Sayfası</h1>
                    
                    <form id="payment-form">
                        <div class="form-group">
                            <label>Kart Numarası:</label>
                            <input type="text" id="cardNumber" value="4543600299100712" placeholder="Test Visa kartı">
                        </div>
                        
                        <div class="form-group">
                            <label>Kart Sahibi:</label>
                            <input type="text" id="cardHolder" value="John Doe">
                        </div>
                        
                        <div class="form-group">
                            <label>Son Kullanma Ayı:</label>
                            <select id="expireMonth">
                                <option value="12" selected>12</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Son Kullanma Yılı:</label>
                            <select id="expireYear">
                                <option value="2030" selected>2030</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>CVC:</label>
                            <input type="text" id="cvc" value="123">
                        </div>
                        
                        <div class="form-group">
                            <label>Tutar:</label>
                            <input type="number" id="amount" value="99.90" step="0.01">
                        </div>
                        
                        <button type="button" onclick="start3DSPayment()">3DS Ödeme Başlat</button>
                    </form>
                    
                    <div id="result"></div>
                </div>
                
                <script>
                    function start3DSPayment() {
                        const data = {
                            conversationId: "3ds-test-" + Date.now(),
                            price: parseFloat(document.getElementById('amount').value),
                            paidPrice: parseFloat(document.getElementById('amount').value),
                            currency: "TRY",
                            installment: 1,
                            basketId: "B" + Date.now(),
                            callbackUrl: "http://localhost:8083/api/payment/iyzico/3ds/callback",
                            
                            cardHolderName: document.getElementById('cardHolder').value,
                            cardNumber: document.getElementById('cardNumber').value,
                            expireMonth: document.getElementById('expireMonth').value,
                            expireYear: document.getElementById('expireYear').value,
                            cvc: document.getElementById('cvc').value,
                            
                            buyerId: "BY1",
                            buyerName: "John",
                            buyerSurname: "Doe",
                            buyerEmail: "john.doe@test.com",
                            buyerPhone: "+905551234567",
                            buyerIdentityNumber: "11111111116",
                            buyerRegistrationAddress: "Test Address",
                            buyerCity: "Istanbul",
                            buyerCountry: "Turkey",
                            
                            courseId: 1,
                            courseName: "Test Kursu"
                        };
                        
                        fetch('/api/payment/iyzico/3ds/initialize', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data)
                        })
                        .then(response => response.json())
                        .then(result => {
                            const resultDiv = document.getElementById('result');
                            
                            if (result.status === 'success' && result.threeDSHtmlContent) {
                                resultDiv.innerHTML = '<div class="success">3DS sayfası yükleniyor...</div>' + result.threeDSHtmlContent;
                            } else {
                                resultDiv.innerHTML = '<div class="error">Hata: ' + (result.errorMessage || 'Bilinmeyen hata') + '</div>';
                            }
                        })
                        .catch(error => {
                            document.getElementById('result').innerHTML = '<div class="error">Hata: ' + error.message + '</div>';
                        });
                    }
                </script>
            </body>
            </html>
            """;
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/html; charset=UTF-8")
                .body(html);
    }
    
    /**
     * Test için örnek 3DS request oluşturur
     */
    private Iyzico3DSRequest createTest3DSRequest() {
        return Iyzico3DSRequest.builder()
                .conversationId("3ds-test-" + System.currentTimeMillis())
                .price(new BigDecimal("99.90"))
                .paidPrice(new BigDecimal("99.90"))
                .currency("TRY")
                .installment(1)
                .basketId("B" + System.currentTimeMillis())
                .paymentChannel("WEB")
                .paymentGroup("PRODUCT")
                .callbackUrl("http://localhost:8083/api/payment/iyzico/3ds/callback")
                
                // Kart bilgileri (İyzico test kartı)
                .cardHolderName("John Doe")
                .cardNumber("4543600299100712")
                .expireMonth("12")
                .expireYear("2030")
                .cvc("123")
                .registerCard(0)
                
                // Alıcı bilgileri
                .buyerId("BY1")
                .buyerName("John")
                .buyerSurname("Doe")
                .buyerEmail("john.doe@test.com")
                .buyerPhone("+905551234567")
                .buyerIdentityNumber("11111111116")
                .buyerRegistrationAddress("Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1")
                .buyerIp("127.0.0.1")
                .buyerCity("Istanbul")
                .buyerCountry("Turkey")
                .buyerZipCode("34732")
                
                // Kurs bilgileri
                .courseId(1L)
                .courseName("Test Online Kursu")
                .courseCategory1("Eğitim")
                .courseCategory2("Online Kurs")
                .itemType("VIRTUAL")
                
                .locale("tr")
                .build();
    }
    
    /**
     * 3DS test kartları bilgisi
     */
    @GetMapping("/test-cards")
    public ResponseEntity<Map<String, Object>> get3DSTestCards() {
        Map<String, Object> testData = new HashMap<>();
        
        // 3DS destekleyen test kartları
        Map<String, Object> cards3DS = new HashMap<>();
        cards3DS.put("visa_3ds", "4543600299100712");
        cards3DS.put("mastercard_3ds", "5528790000000008");
        cards3DS.put("visa_3ds_enrolled", "4766620000000001");
        cards3DS.put("mastercard_3ds_enrolled", "5166570000000004");
        
        testData.put("cards_3ds", cards3DS);
        testData.put("test_expire_month", "12");
        testData.put("test_expire_year", "2030");
        testData.put("test_cvc", "123");
        testData.put("test_holder_name", "John Doe");
        testData.put("callback_url", "http://localhost:8083/api/payment/iyzico/3ds/callback");
        
        return ResponseEntity.ok(testData);
    }
}
