package payment_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import payment_service.entity.Enrollment;
import payment_service.repository.EnrollmentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<List<Enrollment>> getUserEnrollments(@RequestHeader("X-User-Id") Long userId) {
        // TODO: filter by userId, for now return all
        return ResponseEntity.ok(enrollmentRepository.findAll());
    }
} 