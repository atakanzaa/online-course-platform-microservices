package payment_service.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
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
      @Value("${app.course-service.base-url:http://localhost:8082/course-service}")
    private String courseServiceUrl;
      /**
     * Kurs bilgilerini getirir
     */
    @CircuitBreaker(name = "course-service", fallbackMethod = "getCourseFallback")
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
    
    // Fallback method for circuit breaker
    public CourseDto getCourseFallback(Long courseId, Exception ex) {
        log.warn("Course service is unavailable, using fallback for courseId: {}", courseId);
        log.warn("Fallback reason: {}", ex.getMessage());
        
        // Fallback response - null dönerek calling service'in bunu handle etmesini sağlıyoruz
        // Alternatif olarak cached data veya default course bilgisi dönülebilir
        return null;
    }
      /**
     * Kursun satın alınabilir olup olmadığını kontrol eder
     */
    @CircuitBreaker(name = "course-service", fallbackMethod = "isCourseAvailableFallback")
    public boolean isCourseAvailable(Long courseId) {
        try {
            CourseDto course = getCourse(courseId);
            return course != null && course.isPublished();
        } catch (Exception e) {
            log.warn("Could not check course availability for id {}: {}", courseId, e.getMessage());
            return false;
        }
    }
    
    // Fallback method for course availability check
    public boolean isCourseAvailableFallback(Long courseId, Exception ex) {
        log.warn("Course service is unavailable, assuming course {} is not available", courseId);
        return false;
    }
}
