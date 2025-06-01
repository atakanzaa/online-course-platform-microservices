package payment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Enrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(name = "payment_id", nullable = false)
    private Long paymentId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;
    
    @Column(name = "enrolled_at", nullable = false)
    private LocalDateTime enrolledAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    private int progress; // 0-100 arası
    
    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        if (progress == 0) {
            progress = 0;
        }
    }
}
