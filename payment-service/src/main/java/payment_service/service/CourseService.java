package payment_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import payment_service.dto.CourseDto;

/**
 * Course Service Client - course-service ile iletişim kurar
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {
    
    private final RestTemplate restTemplate;
    
    @Value("${course-service.url:http://localhost:8082}")
    private String courseServiceUrl;
    
    /**
     * Kurs bilgilerini getirir
     */
    public CourseDto getCourse(Long courseId) {
        try {
            String url = courseServiceUrl + "/api/courses/" + courseId;
            log.info("Fetching course details from: {}", url);
            
            ResponseEntity<CourseDto> response = restTemplate.getForEntity(url, CourseDto.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching course with id {}: {}", courseId, e.getMessage());
            throw new RuntimeException("Failed to fetch course details", e);
        }
    }
    
    /**
     * Kursun satın alınabilir olup olmadığını kontrol eder
     */
    public boolean isCourseAvailable(Long courseId) {
        try {
            CourseDto course = getCourse(courseId);
            return course != null && course.isPublished();
        } catch (Exception e) {
            log.warn("Could not check course availability for id {}: {}", courseId, e.getMessage());
            return false;
        }
    }
}
