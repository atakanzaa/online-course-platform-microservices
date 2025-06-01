package course_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String videoId; // media-service ile ilişki için

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;
} 