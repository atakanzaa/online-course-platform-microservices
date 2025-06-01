package course_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String category;
    private String language;
    private String level;

    @NotNull(message = "InstructorId is required")
    private Long instructorId;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    private List<ModuleRequest> modules;
}