package payment_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import payment_service.event.PaymentSuccessEvent;

@Service
@Slf4j
public class PaymentEventService {

    public void publishPaymentSuccessEvent(PaymentSuccessEvent event) {
        // For now, just log the event (replace with actual notification service call later)
        log.info("Payment success event processed for payment: {}, user: {}, amount: {}", 
                event.getPaymentId(), event.getUserId(), event.getAmount());
        
        // TODO: Call notification service REST API to send email/SMS
        // restTemplate.postForObject("http://notification-service/api/notifications/payment-success", event, Void.class);
    }
}
