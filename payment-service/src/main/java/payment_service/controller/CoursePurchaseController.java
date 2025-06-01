package payment_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.dto.CourseDto;
import payment_service.dto.CoursePurchaseRequest;
import payment_service.dto.CoursePurchaseResponse;
import payment_service.service.CoursePurchaseService;

/**
 * Kurs satın alma işlemlerini yöneten controller
 */
@RestController
@RequestMapping("/api/payment/course-purchase")
@RequiredArgsConstructor
@Slf4j
public class CoursePurchaseController {
    
    private final CoursePurchaseService coursePurchaseService;
    
    /**
     * Kurs satın alma işlemi - direkt ödeme
     */
    @PostMapping("/direct")
    public ResponseEntity<CoursePurchaseResponse> purchaseCourse(@RequestBody CoursePurchaseRequest request) {
        log.info("Processing direct course purchase for user {} and course {}", 
                request.getUserId(), request.getCourseId());
        
        CoursePurchaseResponse response = coursePurchaseService.purchaseCourseDirectly(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * 3DS ile kurs satın alma işlemi - 3DS başlatma
     */
    @PostMapping("/3ds/initialize")
    public ResponseEntity<CoursePurchaseResponse> initialize3DSPurchase(@RequestBody CoursePurchaseRequest request) {
        log.info("Initializing 3DS course purchase for user {} and course {}", 
                request.getUserId(), request.getCourseId());
        
        CoursePurchaseResponse response = coursePurchaseService.initiate3DSPurchase(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Kullanıcının satın aldığı kursları listele
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPurchasedCourses(@PathVariable Long userId) {
        try {
            var purchasedCourses = coursePurchaseService.getUserPurchasedCourses(userId);
            return ResponseEntity.ok(purchasedCourses);
        } catch (Exception e) {
            log.error("Error fetching purchased courses for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to fetch purchased courses");
        }
    }
    
    /**
     * Kullanıcının belirli kursu satın alıp almadığını kontrol et
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkCoursePurchase(
            @RequestParam Long userId,
            @RequestParam Long courseId) {
        
        boolean purchased = coursePurchaseService.isCoursePurchased(userId, courseId);
        return ResponseEntity.ok(purchased);
    }
}
