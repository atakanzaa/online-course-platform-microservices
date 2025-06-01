package course_service.controller;

import course_service.dto.CourseRequest;
import course_service.entity.Course;
import course_service.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<Course> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourse(@PathVariable Long id) {
        return courseService.getCourse(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<Course>> getCoursesByInstructor(@PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.getCoursesByInstructor(instructorId));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Course>> getCoursesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(category));
    }

    @GetMapping("/published/{published}")
    public ResponseEntity<List<Course>> getCoursesByPublished(@PathVariable boolean published) {
        return ResponseEntity.ok(courseService.getCoursesByPublished(published));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String q) {
        return ResponseEntity.ok(courseService.searchCourses(q));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Course> setPublished(@PathVariable Long id, @RequestParam boolean published) {
        return ResponseEntity.ok(courseService.setPublished(id, published));
    }
} 