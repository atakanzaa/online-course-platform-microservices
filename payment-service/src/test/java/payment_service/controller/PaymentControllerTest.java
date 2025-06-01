package payment_service.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import payment_service.dto.PaymentRequest;
import payment_service.dto.PaymentResponse;
import payment_service.entity.PaymentStatus;
import payment_service.service.PaymentService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentService paymentService;

    @Test
    void createPayment_ShouldReturnSuccessfulPayment() throws Exception {
        // Given
        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .userId(1L)
                .courseId(1L)
                .amount(new BigDecimal("99.99"))
                .status(PaymentStatus.SUCCESS)
                .provider("IYZICO")
                .transactionId("TXN123")
                .createdAt(LocalDateTime.now())
                .build();

        when(paymentService.processPayment(any(PaymentRequest.class))).thenReturn(mockResponse);

        String paymentRequestJson = """
            {
                "userId": 1,
                "courseId": 1,
                "amount": 99.99,
                "paymentMethod": "IYZICO",
                "buyerName": "Test",
                "buyerSurname": "User",
                "buyerEmail": "test@example.com",
                "buyerPhone": "5555555555",
                "buyerIdentityNumber": "11111111111",
                "buyerAddress": "Test Address",
                "buyerCity": "Istanbul",
                "buyerCountry": "Turkey",
                "buyerZipCode": "34000",
                "cardHolderName": "Test User",
                "cardNumber": "5528790000000008",
                "expireMonth": "12",
                "expireYear": "2030",
                "cvc": "123"
            }
            """;

        // When & Then
        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(paymentRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.provider").value("IYZICO"));
    }

    @Test
    void getPayment_ShouldReturnPayment_WhenExists() throws Exception {
        // Given
        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .userId(1L)
                .courseId(1L)
                .amount(new BigDecimal("99.99"))
                .status(PaymentStatus.SUCCESS)
                .provider("IYZICO")
                .build();

        when(paymentService.getPayment(1L)).thenReturn(Optional.of(mockResponse));        // When & Then
        mockMvc.perform(get("/api/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void getPayment_ShouldReturnNotFound_WhenNotExists() throws Exception {
        // Given
        when(paymentService.getPayment(999L)).thenReturn(Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/payments/999"))
                .andExpect(status().isNotFound());
    }
}
