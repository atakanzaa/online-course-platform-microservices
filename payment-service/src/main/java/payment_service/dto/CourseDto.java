package payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String language;
    private String level;
    private Long instructorId;
    private BigDecimal price;
    private boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
