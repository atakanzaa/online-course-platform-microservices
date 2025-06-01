package notification_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    // Queue names
    public static final String EMAIL_QUEUE = "email.queue";
    public static final String SMS_QUEUE = "sms.queue";
    public static final String PUSH_NOTIFICATION_QUEUE = "push.notification.queue";
    
    // Exchange name
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public Queue emailQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE).build();
    }

    @Bean
    public Queue smsQueue() {
        return QueueBuilder.durable(SMS_QUEUE).build();
    }

    @Bean
    public Queue pushNotificationQueue() {
        return QueueBuilder.durable(PUSH_NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Binding emailBinding() {
        return BindingBuilder
                .bind(emailQueue())
                .to(notificationExchange())
                .with("notification.email.*");
    }

    @Bean
    public Binding smsBinding() {
        return BindingBuilder
                .bind(smsQueue())
                .to(notificationExchange())
                .with("notification.sms.*");
    }

    @Bean
    public Binding pushNotificationBinding() {
        return BindingBuilder
                .bind(pushNotificationQueue())
                .to(notificationExchange())
                .with("notification.push.*");
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
