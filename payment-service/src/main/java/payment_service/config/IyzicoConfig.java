package payment_service.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "iyzico")
@Data
public class IyzicoConfig {
    private String apiKey;
    private String secretKey;
    private String baseUrl;
    private boolean sandboxMode = true; // Test ortamı için true
    
    // Test ortamı için default değerler
    public String getBaseUrl() {
        if (sandboxMode) {
            return "https://sandbox-api.iyzipay.com";
        }
        return baseUrl != null ? baseUrl : "https://api.iyzipay.com";
    }
}
