package course_service.dto;

import lombok.Data;
import java.util.List;

@Data
public class ModuleRequest {
    private String title;
    private List<LessonRequest> lessons;
} 