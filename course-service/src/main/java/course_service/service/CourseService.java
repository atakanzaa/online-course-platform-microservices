package course_service.service;

import course_service.dto.CourseRequest;
import course_service.dto.LessonRequest;
import course_service.dto.ModuleRequest;
import course_service.entity.Course;
import course_service.entity.Lesson;
import course_service.entity.Module;
import course_service.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;

    @Transactional
    public Course createCourse(CourseRequest request) {
        Course course = mapToCourse(request);
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setLanguage(request.getLanguage());
        course.setLevel(request.getLevel());
        course.setInstructorId(request.getInstructorId());
        course.setPrice(request.getPrice());
        // Modülleri güncelle
        course.getModules().clear();
        if (request.getModules() != null) {
            for (ModuleRequest moduleRequest : request.getModules()) {
                Module module = mapToModule(moduleRequest);
                module.setCourse(course);
                course.getModules().add(module);
            }
        }
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }

    public Optional<Course> getCourse(Long id) {
        return courseRepository.findById(id);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByInstructor(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategoryIgnoreCase(category);
    }

    public List<Course> getCoursesByPublished(boolean isPublished) {
        return courseRepository.findByIsPublished(isPublished);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    @Transactional
    public Course setPublished(Long id, boolean published) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setPublished(published);
        return courseRepository.save(course);    }

    // --- Mapping helpers ---
    private Course mapToCourse(CourseRequest request) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .language(request.getLanguage())
                .level(request.getLevel())
                .instructorId(request.getInstructorId())
                .price(request.getPrice())
                .modules(new ArrayList<>())
                .build();
        if (request.getModules() != null) {
            for (ModuleRequest moduleRequest : request.getModules()) {
                Module module = mapToModule(moduleRequest);
                module.setCourse(course);
                course.getModules().add(module);
            }
        }
        return course;
    }

    private Module mapToModule(ModuleRequest request) {
        Module module = Module.builder()
                .title(request.getTitle())
                .lessons(new ArrayList<>())
                .build();
        if (request.getLessons() != null) {
            for (LessonRequest lessonRequest : request.getLessons()) {
                Lesson lesson = mapToLesson(lessonRequest);
                lesson.setModule(module);
                module.getLessons().add(lesson);
            }
        }
        return module;
    }

    private Lesson mapToLesson(LessonRequest request) {
        return Lesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .videoId(request.getVideoId())
                .build();
    }
} 