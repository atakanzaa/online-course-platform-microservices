package payment_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import payment_service.dto.*;
import payment_service.entity.Payment;
import payment_service.entity.PaymentStatus;
import payment_service.repository.PaymentRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final IyzicoApiService iyzicoApiService;
    private final CourseService courseService;
    
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        try {
            // Kurs bilgilerini course-service'den al
            CourseDto course = courseService.getCourse(request.getCourseId());
            if (course == null) {
                throw new RuntimeException("Course not found with id: " + request.getCourseId());
            }
            
            if (!course.isPublished()) {
                throw new RuntimeException("Course is not published");
            }
            
            // Kurs fiyatını al (request'teki amount yerine course fiyatını kullan)
            BigDecimal coursePrice = course.getPrice();
            if (coursePrice == null || coursePrice.compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Invalid course price");
            }
            
            // Payment kaydı oluştur (PENDING durumunda)
            Payment payment = Payment.builder()
                    .userId(request.getUserId())
                    .courseId(request.getCourseId())
                    .amount(coursePrice) // Course'dan gelen fiyatı kullan
                    .status(PaymentStatus.PENDING)
                    .provider("IYZICO")
                    .build();
            
            payment = paymentRepository.save(payment);
            
            // İyzico isteği hazırla
            IyzicoPaymentRequest iyzicoRequest = IyzicoPaymentRequest.builder()
                    .userId(request.getUserId())
                    .courseId(request.getCourseId())
                    .amount(coursePrice) // Course'dan gelen fiyatı kullan
                    .currency("TRY")
                    .buyerName(request.getBuyerName())
                    .buyerSurname(request.getBuyerSurname())
                    .buyerEmail(request.getBuyerEmail())
                    .buyerPhone(request.getBuyerPhone())
                    .buyerIdentityNumber(request.getBuyerIdentityNumber())
                    .buyerAddress(request.getBuyerAddress())
                    .buyerCity(request.getBuyerCity())
                    .buyerCountry(request.getBuyerCountry())
                    .buyerZipCode(request.getBuyerZipCode())
                    .cardHolderName(request.getCardHolderName())
                    .cardNumber(request.getCardNumber())
                    .expireMonth(request.getExpireMonth())
                    .expireYear(request.getExpireYear())
                    .cvc(request.getCvc())
                    .conversationId("CONV" + payment.getId())
                    .build();
            
            // İyzico'ya ödeme isteği gönder
            IyzicoPaymentResponse iyzicoResponse = iyzicoApiService.createPayment(iyzicoRequest);
            
            // Yanıta göre payment durumunu güncelle
            if ("success".equals(iyzicoResponse.getStatus()) && 
                "SUCCESS".equals(iyzicoResponse.getPaymentStatus())) {
                
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId(iyzicoResponse.getPaymentId());
                
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                // Hata mesajını kaydet (opsiyonel: Payment entity'sine errorMessage alanı eklenebilir)
            }
            
            payment = paymentRepository.save(payment);
            
            return mapToPaymentResponse(payment, iyzicoResponse.getErrorMessage());
            
        } catch (Exception e) {
            log.error("Ödeme işlemi başarısız: ", e);
            
            // Hatalı durumda da payment kaydı oluştur
            Payment failedPayment = Payment.builder()
                    .userId(request.getUserId())
                    .courseId(request.getCourseId())
                    .amount(request.getAmount())
                    .status(PaymentStatus.FAILED)
                    .provider("IYZICO")
                    .build();
            
            failedPayment = paymentRepository.save(failedPayment);
            
            return mapToPaymentResponse(failedPayment, "Sistem hatası: " + e.getMessage());
        }
    }
    
    public Optional<PaymentResponse> getPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .map(payment -> mapToPaymentResponse(payment, null));
    }
    
    public List<PaymentResponse> getPaymentsByUser(Long userId) {
        return paymentRepository.findByUserId(userId).stream()
                .map(payment -> mapToPaymentResponse(payment, null))
                .toList();
    }
    
    public List<PaymentResponse> getPaymentsByCourse(Long courseId) {
        return paymentRepository.findByCourseId(courseId).stream()
                .map(payment -> mapToPaymentResponse(payment, null))
                .toList();
    }
    
    public boolean isCoursePurchased(Long userId, Long courseId) {
        return paymentRepository.findByUserIdAndCourseIdAndStatus(userId, courseId, PaymentStatus.SUCCESS)
                .isPresent();
    }
    
    private PaymentResponse mapToPaymentResponse(Payment payment, String errorMessage) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUserId())
                .courseId(payment.getCourseId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .provider(payment.getProvider())
                .transactionId(payment.getTransactionId())
                .errorMessage(errorMessage)
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
