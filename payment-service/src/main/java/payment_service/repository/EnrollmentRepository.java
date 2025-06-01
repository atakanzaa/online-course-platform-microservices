package payment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import payment_service.entity.Enrollment;
import payment_service.entity.EnrollmentStatus;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    /**
     * Kullanıcının belirli kursa kaydını bulur
     */
    Optional<Enrollment> findByUserIdAndCourseId(Long userId, Long courseId);
    
    /**
     * Kullanıcının tüm kurs kayıtlarını getirir
     */
    List<Enrollment> findByUserId(Long userId);
    
    /**
     * Kullanıcının aktif kurs kayıtlarını getirir
     */
    List<Enrollment> findByUserIdAndStatus(Long userId, EnrollmentStatus status);
    
    /**
     * Kursa kayıtlı tüm kullanıcıları getirir
     */
    List<Enrollment> findByCourseId(Long courseId);
    
    /**
     * Kullanıcının belirli kursa aktif kaydının olup olmadığını kontrol eder
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END " +
           "FROM Enrollment e WHERE e.userId = :userId AND e.courseId = :courseId AND e.status = 'ACTIVE'")
    boolean existsActiveEnrollment(@Param("userId") Long userId, @Param("courseId") Long courseId);
    
    /**
     * Ödeme ID'sine göre enrollment bulur
     */
    Optional<Enrollment> findByPaymentId(Long paymentId);
}
