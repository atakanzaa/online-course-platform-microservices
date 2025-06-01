package payment_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import payment_service.event.PaymentSuccessEvent;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentEventService {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String PAYMENT_SUCCESS_TOPIC = "payment-success";

    public void publishPaymentSuccessEvent(PaymentSuccessEvent event) {
        try {
            kafkaTemplate.send(PAYMENT_SUCCESS_TOPIC, event.getPaymentId(), event);
            log.info("Payment success event published for payment: {}", event.getPaymentId());
        } catch (Exception e) {
            log.error("Failed to publish payment success event for payment: {}", event.getPaymentId(), e);
            throw new RuntimeException("Failed to publish payment event", e);
        }
    }
}
