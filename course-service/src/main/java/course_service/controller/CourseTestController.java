package course_service.controller;

import course_service.dto.CourseRequest;
import course_service.entity.Course;
import course_service.service.CourseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Test amaçlı kurs oluşturma endpoint'leri
 */
@RestController
@RequestMapping("/api/courses/test")
@RequiredArgsConstructor
@Slf4j
public class CourseTestController {
    
    private final CourseService courseService;
    
    /**
     * Test kursları oluştur
     */
    @PostMapping("/create-sample-courses")
    public ResponseEntity<List<Course>> createSampleCourses() {
        log.info("Creating sample courses for testing");
        
        List<Course> createdCourses = new ArrayList<>();
        
        // Sample courses
        List<CourseRequest> sampleCourses = Arrays.asList(
            CourseRequest.builder()
                .title("Java Spring Boot Masterclass")
                .description("Complete Spring Boot development course with hands-on projects")
                .category("Programming")
                .language("Turkish")
                .level("Intermediate")
                .instructorId(1L)
                .price(new BigDecimal("299.99"))
                .build(),
                
            CourseRequest.builder()
                .title("React.js for Beginners")
                .description("Learn React.js from scratch with modern techniques")
                .category("Programming")
                .language("Turkish")
                .level("Beginner")
                .instructorId(1L)
                .price(new BigDecimal("199.99"))
                .build(),
                
            CourseRequest.builder()
                .title("Python Data Science")
                .description("Data science and machine learning with Python")
                .category("Data Science")
                .language("Turkish")
                .level("Advanced")
                .instructorId(2L)
                .price(new BigDecimal("399.99"))
                .build(),
                
            CourseRequest.builder()
                .title("Digital Marketing Fundamentals")
                .description("Complete guide to digital marketing strategies")
                .category("Marketing")
                .language("Turkish")
                .level("Beginner")
                .instructorId(3L)
                .price(new BigDecimal("149.99"))
                .build(),
                
            CourseRequest.builder()
                .title("Free JavaScript Course")
                .description("Free introductory JavaScript course")
                .category("Programming")
                .language("Turkish")
                .level("Beginner")
                .instructorId(1L)
                .price(BigDecimal.ZERO)
                .build()
        );
        
        for (CourseRequest courseRequest : sampleCourses) {
            try {
                Course course = courseService.createCourse(courseRequest);
                // Automatically publish the course
                course = courseService.setPublished(course.getId(), true);
                createdCourses.add(course);
                log.info("Created and published course: {}", course.getTitle());
            } catch (Exception e) {
                log.error("Error creating course {}: {}", courseRequest.getTitle(), e.getMessage());
            }
        }
        
        return ResponseEntity.ok(createdCourses);
    }
    
    /**
     * Belirli bir kursu ID ile getir (test amaçlı)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Course> getTestCourse(@PathVariable Long id) {
        return courseService.getCourse(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Tüm yayınlanmış kursları getir
     */
    @GetMapping("/published")
    public ResponseEntity<List<Course>> getPublishedCourses() {
        List<Course> publishedCourses = courseService.getCoursesByPublished(true);
        return ResponseEntity.ok(publishedCourses);
    }
    
    /**
     * Test için kurs fiyatını güncelle
     */
    @PatchMapping("/{id}/price")
    public ResponseEntity<Course> updateCoursePrice(@PathVariable Long id, @RequestParam BigDecimal price) {
        try {
            Course course = courseService.getCourse(id).orElseThrow(() -> new RuntimeException("Course not found"));
            course.setPrice(price);
            // Course entity'sini direkt kaydetmek için CourseRequest oluştur
            CourseRequest updateRequest = CourseRequest.builder()
                    .title(course.getTitle())
                    .description(course.getDescription())
                    .category(course.getCategory())
                    .language(course.getLanguage())
                    .level(course.getLevel())
                    .instructorId(course.getInstructorId())
                    .price(price)
                    .build();
            
            Course updatedCourse = courseService.updateCourse(id, updateRequest);
            return ResponseEntity.ok(updatedCourse);
        } catch (Exception e) {
            log.error("Error updating course price: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Course Test Controller is running!");
    }
}
