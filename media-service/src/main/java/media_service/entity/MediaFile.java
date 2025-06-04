package media_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "media_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String originalFileName;
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private String fileType; // video, image, document
    
    @Column(nullable = false)
    private String mimeType;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Column(nullable = false)
    private Long uploadedBy; // User ID who uploaded the file
    
    @Column(nullable = false)
    private Long courseId; // Course this media belongs to
    
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
