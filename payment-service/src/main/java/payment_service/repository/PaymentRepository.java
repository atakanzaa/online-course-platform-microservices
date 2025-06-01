package payment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import payment_service.entity.Payment;
import payment_service.entity.PaymentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByUserId(Long userId);
    
    List<Payment> findByCourseId(Long courseId);
    
    List<Payment> findByStatus(PaymentStatus status);
    
    Optional<Payment> findByUserIdAndCourseIdAndStatus(Long userId, Long courseId, PaymentStatus status);
    
    List<Payment> findByUserIdAndStatus(Long userId, PaymentStatus status);
    
    Optional<Payment> findByTransactionId(String transactionId);
}
