package course_service.dto;

import lombok.Data;

@Data
public class LessonRequest {
    private String title;
    private String description;
    private String videoId;
} 