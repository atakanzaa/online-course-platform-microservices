package media_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MediaUploadRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String description;
}
