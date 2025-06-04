package user_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import user_service.dto.UpdateUserRoleRequest;
import user_service.dto.UserDto;
import user_service.entity.Role;
import user_service.service.AdminService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    /**
     * Get all users with pagination
     */
    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }
    
    /**
     * Get user by ID
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserById(userId));
    }
    
    /**
     * Get users by role
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserDto>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(adminService.getUsersByRole(role));
    }
    
    /**
     * Get all teachers/instructors
     */
    @GetMapping("/teachers")
    public ResponseEntity<List<UserDto>> getAllTeachers() {
        return ResponseEntity.ok(adminService.getAllTeachers());
    }
    
    /**
     * Get all students
     */
    @GetMapping("/students")
    public ResponseEntity<List<UserDto>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }
    
    /**
     * Update user role
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, request));
    }
    
    /**
     * Delete user
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
