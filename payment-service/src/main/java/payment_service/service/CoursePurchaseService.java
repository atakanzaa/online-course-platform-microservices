package payment_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import payment_service.dto.*;
import payment_service.entity.*;
import payment_service.repository.EnrollmentRepository;
import payment_service.repository.PaymentRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Kurs satın alma ve enrollment işlemlerini yöneten ana service
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CoursePurchaseService {
    
    private final CourseService courseService;
    private final IyzicoApiService iyzicoApiService;
    private final PaymentRepository paymentRepository;
    private final EnrollmentRepository enrollmentRepository;
    
    /**
     * Direkt kurs satın alma (3DS olmadan)
     */
    @Transactional
    public CoursePurchaseResponse purchaseCourseDirectly(CoursePurchaseRequest request) {
        try {
            log.info("Starting direct course purchase for user {} and course {}", 
                    request.getUserId(), request.getCourseId());
            
            // 1. Kurs bilgilerini al ve kontrol et
            CourseDto course = validateAndGetCourse(request.getCourseId());
            
            // 2. Kullanıcının zaten bu kursu satın alıp almadığını kontrol et
            if (isCoursePurchased(request.getUserId(), request.getCourseId())) {
                return CoursePurchaseResponse.builder()
                        .success(false)
                        .status("ALREADY_PURCHASED")
                        .message("Course already purchased by user")
                        .courseId(course.getId())
                        .courseName(course.getTitle())
                        .build();
            }
            
            // 3. Payment kaydı oluştur
            Payment payment = createPaymentRecord(request.getUserId(), course);
            
            // 4. İyzico ile ödeme yap
            IyzicoPaymentRequest iyzicoRequest = buildIyzicoRequest(request, course);
            IyzicoPaymentResponse iyzicoResponse = iyzicoApiService.makePayment(iyzicoRequest);
            
            // 5. Ödeme sonucunu işle
            return processPaymentResult(payment, course, iyzicoResponse, request.getUserId());
            
        } catch (Exception e) {
            log.error("Error during direct course purchase: {}", e.getMessage(), e);
            return CoursePurchaseResponse.builder()
                    .success(false)
                    .status("FAILURE")
                    .message("Payment failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * 3DS ile kurs satın alma başlatma
     */
    @Transactional
    public CoursePurchaseResponse initiate3DSPurchase(CoursePurchaseRequest request) {
        try {
            log.info("Starting 3DS course purchase for user {} and course {}", 
                    request.getUserId(), request.getCourseId());
            
            // 1. Kurs bilgilerini al ve kontrol et
            CourseDto course = validateAndGetCourse(request.getCourseId());
            
            // 2. Kullanıcının zaten bu kursu satın alıp almadığını kontrol et
            if (isCoursePurchased(request.getUserId(), request.getCourseId())) {
                return CoursePurchaseResponse.builder()
                        .success(false)
                        .status("ALREADY_PURCHASED")
                        .message("Course already purchased by user")
                        .courseId(course.getId())
                        .courseName(course.getTitle())
                        .build();
            }
            
            // 3. Payment kaydı oluştur
            Payment payment = createPaymentRecord(request.getUserId(), course);
            
            // 4. 3DS isteği hazırla
            Iyzico3DSRequest threeDSRequest = build3DSRequest(request, course, payment.getId());
            Iyzico3DSResponse threeDSResponse = iyzicoApiService.initialize3DSPayment(threeDSRequest);
            
            // 5. 3DS sonucunu döndür
            return CoursePurchaseResponse.builder()
                    .success(true)
                    .status("REQUIRES_3DS")
                    .message("3DS authentication required")
                    .paymentId(payment.getId())
                    .courseId(course.getId())
                    .courseName(course.getTitle())
                    .amount(course.getPrice())
                    .threeDSHtmlContent(threeDSResponse.getHtmlContent())
                    .callbackUrl(request.getCallbackUrl())
                    .build();
            
        } catch (Exception e) {
            log.error("Error during 3DS course purchase initiation: {}", e.getMessage(), e);
            return CoursePurchaseResponse.builder()
                    .success(false)
                    .status("FAILURE")
                    .message("3DS initiation failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Kullanıcının satın aldığı kursları getir
     */
    public List<CourseDto> getUserPurchasedCourses(Long userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserIdAndStatus(userId, EnrollmentStatus.ACTIVE);
        
        return enrollments.stream()
                .map(enrollment -> {
                    try {
                        return courseService.getCourse(enrollment.getCourseId());
                    } catch (Exception e) {
                        log.warn("Could not fetch course {} for user {}: {}", 
                                enrollment.getCourseId(), userId, e.getMessage());
                        return null;
                    }
                })
                .filter(course -> course != null)
                .collect(Collectors.toList());
    }
    
    /**
     * Kullanıcının belirli kursu satın alıp almadığını kontrol et
     */
    public boolean isCoursePurchased(Long userId, Long courseId) {
        return enrollmentRepository.existsActiveEnrollment(userId, courseId);
    }
    
    // === Private Helper Methods ===
    
    private CourseDto validateAndGetCourse(Long courseId) {
        CourseDto course = courseService.getCourse(courseId);
        if (course == null) {
            throw new RuntimeException("Course not found with id: " + courseId);
        }
        
        if (!course.isPublished()) {
            throw new RuntimeException("Course is not published");
        }
        
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid course price");
        }
        
        return course;
    }
    
    private Payment createPaymentRecord(Long userId, CourseDto course) {
        Payment payment = Payment.builder()
                .userId(userId)
                .courseId(course.getId())
                .amount(course.getPrice())
                .status(PaymentStatus.PENDING)
                .provider("IYZICO")
                .build();
        
        return paymentRepository.save(payment);
    }
    
    private IyzicoPaymentRequest buildIyzicoRequest(CoursePurchaseRequest request, CourseDto course) {
        return IyzicoPaymentRequest.builder()
                .userId(request.getUserId())
                .courseId(course.getId())
                .amount(course.getPrice())
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
                .conversationId(UUID.randomUUID().toString())
                .build();
    }
    
    private Iyzico3DSRequest build3DSRequest(CoursePurchaseRequest request, CourseDto course, Long paymentId) {
        String callbackUrl = request.getCallbackUrl() != null ? 
                request.getCallbackUrl() : "http://localhost:8083/api/payment/iyzico/3ds/callback";
        
        return Iyzico3DSRequest.builder()
                .conversationId("payment-" + paymentId)
                .price(course.getPrice())
                .paidPrice(course.getPrice())
                .currency("TRY")
                .basketId("B" + course.getId())
                .paymentGroup("PRODUCT")
                .callbackUrl(callbackUrl)
                .cardHolderName(request.getCardHolderName())
                .cardNumber(request.getCardNumber())
                .expireMonth(request.getExpireMonth())
                .expireYear(request.getExpireYear())
                .cvc(request.getCvc())
                .buyerId(request.getUserId().toString())
                .buyerName(request.getBuyerName())
                .buyerSurname(request.getBuyerSurname())
                .buyerEmail(request.getBuyerEmail())
                .buyerPhone(request.getBuyerPhone())
                .buyerIdentityNumber(request.getBuyerIdentityNumber())
                .buyerRegistrationAddress(request.getBuyerAddress())
                .buyerCity(request.getBuyerCity())
                .buyerCountry(request.getBuyerCountry())
                .courseId(course.getId())
                .courseName(course.getTitle())
                .build();
    }
    
    private CoursePurchaseResponse processPaymentResult(Payment payment, CourseDto course, 
                                                       IyzicoPaymentResponse iyzicoResponse, Long userId) {
        
        if ("success".equals(iyzicoResponse.getStatus()) && "SUCCESS".equals(iyzicoResponse.getPaymentStatus())) {
            // Ödeme başarılı - payment'ı güncelle ve enrollment oluştur
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(iyzicoResponse.getPaymentId());
            paymentRepository.save(payment);
            
            // Enrollment oluştur
            Enrollment enrollment = createEnrollment(userId, course.getId(), payment.getId());
            
            log.info("Course purchase completed successfully. Payment ID: {}, Enrollment ID: {}", 
                    payment.getId(), enrollment.getId());
            
            return CoursePurchaseResponse.builder()
                    .success(true)
                    .status("SUCCESS")
                    .message("Course purchased successfully")
                    .paymentId(payment.getId())
                    .transactionId(iyzicoResponse.getPaymentId())
                    .amount(course.getPrice())
                    .courseId(course.getId())
                    .courseName(course.getTitle())
                    .enrolled(true)
                    .enrollmentStatus("ACTIVE")
                    .paymentStatus(iyzicoResponse.getPaymentStatus())
                    .fraudStatus(iyzicoResponse.getFraudStatus())
                    .cardType(iyzicoResponse.getCardType())
                    .cardAssociation(iyzicoResponse.getCardAssociation())
                    .lastFourDigits(iyzicoResponse.getLastFourDigits())
                    .build();
        } else {
            // Ödeme başarısız
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            
            return CoursePurchaseResponse.builder()
                    .success(false)
                    .status("FAILURE")
                    .message("Payment failed")
                    .paymentId(payment.getId())
                    .courseId(course.getId())
                    .courseName(course.getTitle())
                    .errorCode(iyzicoResponse.getErrorCode())
                    .errorMessage(iyzicoResponse.getErrorMessage())
                    .build();
        }
    }
    
    private Enrollment createEnrollment(Long userId, Long courseId, Long paymentId) {
        Enrollment enrollment = Enrollment.builder()
                .userId(userId)
                .courseId(courseId)
                .paymentId(paymentId)
                .status(EnrollmentStatus.ACTIVE)
                .progress(0)
                .build();
        
        return enrollmentRepository.save(enrollment);
    }
}
