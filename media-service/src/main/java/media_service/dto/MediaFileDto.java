package media_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaFileDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String filePath;
    private String fileType;
    private String mimeType;
    private Long fileSize;
    private Long uploadedBy;
    private Long courseId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String downloadUrl;
    private String streamUrl;
}
