package course_service.repository;

import course_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByCategoryIgnoreCase(String category);
    List<Course> findByIsPublished(boolean isPublished);
    List<Course> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
} 