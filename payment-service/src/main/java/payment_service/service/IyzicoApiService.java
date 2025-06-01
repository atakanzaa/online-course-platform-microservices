package payment_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import payment_service.config.IyzicoConfig;
import payment_service.dto.IyzicoPaymentRequest;
import payment_service.dto.IyzicoPaymentResponse;
import payment_service.dto.Iyzico3DSRequest;
import payment_service.dto.Iyzico3DSResponse;
import payment_service.dto.Iyzico3DSCompleteRequest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class IyzicoApiService {
    
    private final IyzicoConfig iyzicoConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 3DS Secure ödeme işlemini başlatır
     */
    public Iyzico3DSResponse initialize3DSPayment(Iyzico3DSRequest request) {
        try {
            String endpoint = "/payment/3dsecure/initialize";
            String url = iyzicoConfig.getBaseUrl() + endpoint;
            
            String randomKey = generateRandomKey();
            Map<String, Object> requestBody = build3DSPaymentRequest(request);
            String authorization = generateAuthorizationHeader(requestBody, endpoint, randomKey);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authorization);
            headers.set("x-iyzi-rnd", randomKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return mapTo3DSResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("3DS ödeme başlatma işlemi başarısız: ", e);
            return Iyzico3DSResponse.builder()
                    .status("failure")
                    .errorMessage("3DS işlemi başlatılamadı: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * 3DS doğrulaması tamamlandıktan sonra ödemeyi sonlandırır
     */
    public IyzicoPaymentResponse complete3DSPayment(Iyzico3DSCompleteRequest request) {
        try {
            String endpoint = "/payment/3dsecure/auth";
            String url = iyzicoConfig.getBaseUrl() + endpoint;
            
            String randomKey = generateRandomKey();
            Map<String, Object> requestBody = build3DSCompleteRequest(request);
            String authorization = generateAuthorizationHeader(requestBody, endpoint, randomKey);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authorization);
            headers.set("x-iyzi-rnd", randomKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return mapToIyzicoResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("3DS ödeme tamamlama işlemi başarısız: ", e);
            return IyzicoPaymentResponse.builder()
                    .status("failure")
                    .errorMessage("3DS ödeme tamamlanamadı: " + e.getMessage())
                    .build();
        }
    }
      public IyzicoPaymentResponse createPayment(IyzicoPaymentRequest request) {
        try {
            String endpoint = "/payment/auth";
            String url = iyzicoConfig.getBaseUrl() + endpoint;
            
            // RandomKey oluştur (her iki header için aynı kullanılacak)
            String randomKey = generateRandomKey();
            
            // İyzico API için gerekli request body oluştur
            Map<String, Object> requestBody = buildPaymentRequest(request);
            
            // Authorization header oluştur
            String authorization = generateAuthorizationHeader(requestBody, endpoint, randomKey);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", authorization);
            headers.set("x-iyzi-rnd", randomKey); // Aynı randomKey kullan
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, 
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            return mapToIyzicoResponse(response.getBody());
            
        } catch (Exception e) {
            log.error("İyzico ödeme isteği başarısız: ", e);
            return IyzicoPaymentResponse.builder()
                    .status("failure")
                    .errorMessage("Ödeme işlemi sırasında hata oluştu: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Alias for createPayment method to match the interface used in CoursePurchaseService
     */
    public IyzicoPaymentResponse makePayment(IyzicoPaymentRequest request) {
        return createPayment(request);
    }
      private Map<String, Object> buildPaymentRequest(IyzicoPaymentRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        // Debug log
        log.debug("Building payment request for amount: {} and conversationId: {}", 
                  request.getAmount(), request.getConversationId());
        
        // Ana ödeme bilgileri
        requestBody.put("locale", "tr");
        requestBody.put("conversationId", request.getConversationId());
        requestBody.put("price", request.getAmount() != null ? request.getAmount().toString() : "0.00");
        requestBody.put("paidPrice", request.getAmount() != null ? request.getAmount().toString() : "0.00");
        requestBody.put("currency", request.getCurrency());
        requestBody.put("installment", 1);
        requestBody.put("basketId", "B" + request.getCourseId());
        
        // Ödeme kartı bilgileri
        Map<String, Object> paymentCard = new HashMap<>();
        paymentCard.put("cardHolderName", request.getCardHolderName());
        paymentCard.put("cardNumber", request.getCardNumber());
        paymentCard.put("expireMonth", request.getExpireMonth());
        paymentCard.put("expireYear", request.getExpireYear());
        paymentCard.put("cvc", request.getCvc());
        paymentCard.put("registerCard", 0);
        requestBody.put("paymentCard", paymentCard);
        
        // Alıcı bilgileri
        Map<String, Object> buyer = new HashMap<>();
        buyer.put("id", "BY" + request.getUserId());
        buyer.put("name", request.getBuyerName());
        buyer.put("surname", request.getBuyerSurname());
        buyer.put("gsmNumber", request.getBuyerPhone());
        buyer.put("email", request.getBuyerEmail());
        buyer.put("identityNumber", request.getBuyerIdentityNumber());
        buyer.put("lastLoginDate", "2023-01-01 12:00:00");
        buyer.put("registrationDate", "2023-01-01 12:00:00");
        buyer.put("registrationAddress", request.getBuyerAddress());
        buyer.put("ip", "127.0.0.1");
        buyer.put("city", request.getBuyerCity());
        buyer.put("country", request.getBuyerCountry());
        buyer.put("zipCode", request.getBuyerZipCode());
        requestBody.put("buyer", buyer);
        
        // Teslimat adresi
        requestBody.put("shippingAddress", buyer);
        
        // Fatura adresi  
        requestBody.put("billingAddress", buyer);
        
        // Sepet öğeleri
        Map<String, Object> basketItem = new HashMap<>();
        basketItem.put("id", "BI" + request.getCourseId());
        basketItem.put("name", "Online Kurs");
        basketItem.put("category1", "Eğitim");
        basketItem.put("category2", "Online Kurs");
        basketItem.put("itemType", "VIRTUAL");
        basketItem.put("price", request.getAmount() != null ? request.getAmount().toString() : "0.00");
        requestBody.put("basketItems", new Object[]{basketItem});
        
        return requestBody;
    }    private String generateAuthorizationHeader(Map<String, Object> requestBody, String endpoint, String randomKey) {
        try {
            // 2. Payload oluştur: randomKey + uri_path + request_body
            String jsonBody = convertToJsonString(requestBody);
            String payload = randomKey + endpoint + jsonBody;
            
            // 3. HMACSHA256 ile şifrele
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                iyzicoConfig.getSecretKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String encryptedData = bytesToHex(hash);
            
            // 4. Authorization string oluştur
            String authorizationString = "apiKey:" + iyzicoConfig.getApiKey() 
                                       + "&randomKey:" + randomKey 
                                       + "&signature:" + encryptedData;
            
            // 5. Base64 encode yap
            String base64EncodedAuthorization = Base64.getEncoder()
                .encodeToString(authorizationString.getBytes(StandardCharsets.UTF_8));
            
            // 6. Final authorization header
            return "IYZWSv2 " + base64EncodedAuthorization;
            
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Authorization header oluşturulamadı", e);
        }    }
    
    private String generateRandomKey() {
        return String.valueOf(Instant.now().toEpochMilli()) + "123456789";
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
      private String convertToJsonString(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.error("JSON conversion hatası: ", e);
            // Fallback to simple JSON (should not happen with Jackson)
            StringBuilder json = new StringBuilder("{");
            map.entrySet().forEach(entry -> {
                json.append("\"").append(entry.getKey()).append("\":");
                if (entry.getValue() instanceof String) {
                    json.append("\"").append(entry.getValue()).append("\",");
                } else {
                    json.append(entry.getValue()).append(",");
                }
            });
            if (json.length() > 1) {
                json.setLength(json.length() - 1); // Son virgülü kaldır
            }
            json.append("}");
            return json.toString();
        }
    }
    
    private IyzicoPaymentResponse mapToIyzicoResponse(Map<String, Object> responseMap) {
        if (responseMap == null) {
            return IyzicoPaymentResponse.builder()
                    .status("failure")
                    .errorMessage("Boş yanıt alındı")
                    .build();
        }
        
        return IyzicoPaymentResponse.builder()
                .status((String) responseMap.get("status"))
                .paymentId((String) responseMap.get("paymentId"))
                .conversationId((String) responseMap.get("conversationId"))
                .errorCode((String) responseMap.get("errorCode"))
                .errorMessage((String) responseMap.get("errorMessage"))
                .paymentStatus((String) responseMap.get("paymentStatus"))
                .fraudStatus((String) responseMap.get("fraudStatus"))
                .cardType((String) responseMap.get("cardType"))
                .cardAssociation((String) responseMap.get("cardAssociation"))
                .binNumber((String) responseMap.get("binNumber"))
                .lastFourDigits((String) responseMap.get("lastFourDigits"))
                .currency((String) responseMap.get("currency"))
                .paidPrice((String) responseMap.get("paidPrice"))
                .price((String) responseMap.get("price"))
                .build();
    }
    
    private Map<String, Object> build3DSPaymentRequest(Iyzico3DSRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
          // Ana ödeme bilgileri
        requestBody.put("locale", request.getLocale() != null ? request.getLocale() : "tr");
        requestBody.put("conversationId", request.getConversationId());
        requestBody.put("price", request.getPrice() != null ? request.getPrice().toString() : "0.00");
        requestBody.put("paidPrice", request.getPaidPrice() != null ? request.getPaidPrice().toString() : "0.00");
        requestBody.put("currency", request.getCurrency() != null ? request.getCurrency() : "TRY");
        requestBody.put("installment", request.getInstallment() != null ? request.getInstallment() : 1);
        requestBody.put("basketId", request.getBasketId());
        requestBody.put("paymentChannel", request.getPaymentChannel() != null ? request.getPaymentChannel() : "WEB");
        requestBody.put("paymentGroup", request.getPaymentGroup() != null ? request.getPaymentGroup() : "PRODUCT");
        requestBody.put("callbackUrl", request.getCallbackUrl());
        
        // Ödeme kartı bilgileri
        Map<String, Object> paymentCard = new HashMap<>();
        paymentCard.put("cardHolderName", request.getCardHolderName());
        paymentCard.put("cardNumber", request.getCardNumber());
        paymentCard.put("expireMonth", request.getExpireMonth());
        paymentCard.put("expireYear", request.getExpireYear());
        paymentCard.put("cvc", request.getCvc());
        paymentCard.put("registerCard", request.getRegisterCard() != null ? request.getRegisterCard() : 0);
        if (request.getCardAlias() != null) {
            paymentCard.put("cardAlias", request.getCardAlias());
        }
        requestBody.put("paymentCard", paymentCard);
        
        // Alıcı bilgileri (Buyer)
        Map<String, Object> buyer = new HashMap<>();
        buyer.put("id", request.getBuyerId());
        buyer.put("name", request.getBuyerName());
        buyer.put("surname", request.getBuyerSurname());
        buyer.put("gsmNumber", request.getBuyerPhone());
        buyer.put("email", request.getBuyerEmail());
        buyer.put("identityNumber", request.getBuyerIdentityNumber());
        buyer.put("lastLoginDate", request.getBuyerLastLoginDate() != null ? request.getBuyerLastLoginDate() : "2023-01-01 12:00:00");
        buyer.put("registrationDate", request.getBuyerRegistrationDate() != null ? request.getBuyerRegistrationDate() : "2023-01-01 12:00:00");
        buyer.put("registrationAddress", request.getBuyerRegistrationAddress());
        buyer.put("ip", request.getBuyerIp() != null ? request.getBuyerIp() : "127.0.0.1");
        buyer.put("city", request.getBuyerCity());
        buyer.put("country", request.getBuyerCountry());
        buyer.put("zipCode", request.getBuyerZipCode());
        requestBody.put("buyer", buyer);
        
        // Teslimat adresi (ShippingAddress) - VIRTUAL ürünler için isteğe bağlı
        Map<String, Object> shippingAddress = new HashMap<>();
        shippingAddress.put("contactName", request.getShippingContactName() != null ? request.getShippingContactName() : request.getBuyerName() + " " + request.getBuyerSurname());
        shippingAddress.put("city", request.getShippingCity() != null ? request.getShippingCity() : request.getBuyerCity());
        shippingAddress.put("country", request.getShippingCountry() != null ? request.getShippingCountry() : request.getBuyerCountry());
        shippingAddress.put("address", request.getShippingAddress() != null ? request.getShippingAddress() : request.getBuyerRegistrationAddress());
        if (request.getShippingZipCode() != null) {
            shippingAddress.put("zipCode", request.getShippingZipCode());
        }
        requestBody.put("shippingAddress", shippingAddress);
        
        // Fatura adresi (BillingAddress)
        Map<String, Object> billingAddress = new HashMap<>();
        billingAddress.put("contactName", request.getBillingContactName() != null ? request.getBillingContactName() : request.getBuyerName() + " " + request.getBuyerSurname());
        billingAddress.put("city", request.getBillingCity() != null ? request.getBillingCity() : request.getBuyerCity());
        billingAddress.put("country", request.getBillingCountry() != null ? request.getBillingCountry() : request.getBuyerCountry());
        billingAddress.put("address", request.getBillingAddress() != null ? request.getBillingAddress() : request.getBuyerRegistrationAddress());
        if (request.getBillingZipCode() != null) {
            billingAddress.put("zipCode", request.getBillingZipCode());
        }
        requestBody.put("billingAddress", billingAddress);
        
        // Sepet öğeleri
        Map<String, Object> basketItem = new HashMap<>();
        basketItem.put("id", "BI" + request.getCourseId());
        basketItem.put("name", request.getCourseName() != null ? request.getCourseName() : "Online Kurs");
        basketItem.put("category1", request.getCourseCategory1() != null ? request.getCourseCategory1() : "Eğitim");
        basketItem.put("category2", request.getCourseCategory2() != null ? request.getCourseCategory2() : "Online Kurs");
        basketItem.put("itemType", request.getItemType() != null ? request.getItemType() : "VIRTUAL");
        basketItem.put("price", request.getPrice() != null ? request.getPrice().toString() : "0.00");
        requestBody.put("basketItems", new Object[]{basketItem});
        
        // Ek bilgiler
        if (request.getPaymentSource() != null) {
            requestBody.put("paymentSource", request.getPaymentSource());
        }
        
        return requestBody;
    }
    
    private Map<String, Object> build3DSCompleteRequest(Iyzico3DSCompleteRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        requestBody.put("locale", request.getLocale() != null ? request.getLocale() : "tr");
        requestBody.put("conversationId", request.getConversationId());
        requestBody.put("paymentId", request.getPaymentId());
        if (request.getPaymentTransactionId() != null) {
            requestBody.put("paymentTransactionId", request.getPaymentTransactionId());
        }
        
        return requestBody;
    }
    
    private Iyzico3DSResponse mapTo3DSResponse(Map<String, Object> responseMap) {
        if (responseMap == null) {
            return Iyzico3DSResponse.builder()
                    .status("failure")
                    .errorMessage("Boş yanıt alındı")
                    .build();
        }
        
        return Iyzico3DSResponse.builder()
                .status((String) responseMap.get("status"))
                .errorCode((String) responseMap.get("errorCode"))
                .errorMessage((String) responseMap.get("errorMessage"))
                .errorGroup((String) responseMap.get("errorGroup"))
                .locale((String) responseMap.get("locale"))
                .systemTime(responseMap.get("systemTime") != null ? Long.valueOf(responseMap.get("systemTime").toString()) : null)
                .conversationId((String) responseMap.get("conversationId"))
                .threeDSHtmlContent((String) responseMap.get("threeDSHtmlContent"))
                .paymentId((String) responseMap.get("paymentId"))
                .paymentTransactionId((String) responseMap.get("paymentTransactionId"))
                .paymentStatus((String) responseMap.get("paymentStatus"))
                .fraudStatus((String) responseMap.get("fraudStatus"))
                .cardType((String) responseMap.get("cardType"))
                .cardAssociation((String) responseMap.get("cardAssociation"))
                .cardFamily((String) responseMap.get("cardFamily"))
                .cardToken((String) responseMap.get("cardToken"))
                .cardUserKey((String) responseMap.get("cardUserKey"))
                .binNumber((String) responseMap.get("binNumber"))
                .lastFourDigits((String) responseMap.get("lastFourDigits"))
                .basketId((String) responseMap.get("basketId"))
                .currency((String) responseMap.get("currency"))
                .callbackUrl((String) responseMap.get("callbackUrl"))
                .build();
    }
}
