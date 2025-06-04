package user_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import user_service.dto.UserDto;
import user_service.entity.User;
import user_service.service.AdminService;
import user_service.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/instructor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INSTRUCTOR')")
public class InstructorController {
    
    private final UserService userService;
    private final AdminService adminService;
    
    /**
     * Get instructor profile
     */
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByUsernameOrEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }
    
    /**
     * Get all students (for instructors to see their students)
     */
    @GetMapping("/students")
    public ResponseEntity<List<UserDto>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }
}
