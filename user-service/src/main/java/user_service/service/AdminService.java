package user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import user_service.dto.UpdateUserRoleRequest;
import user_service.dto.UserDto;
import user_service.entity.Role;
import user_service.entity.User;
import user_service.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    
    /**
     * Get all users with pagination
     */
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::convertToDto);
    }
    
    /**
     * Get users by role
     */
    public List<UserDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update user role
     */
    @Transactional
    public UserDto updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(request.getRole());
        User updatedUser = userRepository.save(user);
        
        return convertToDto(updatedUser);
    }
    
    /**
     * Delete user
     */
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }
    
    /**
     * Get user by ID
     */
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }
    
    /**
     * Get all teachers/instructors
     */
    public List<UserDto> getAllTeachers() {
        return getUsersByRole(Role.INSTRUCTOR);
    }
    
    /**
     * Get all students
     */
    public List<UserDto> getAllStudents() {
        return getUsersByRole(Role.STUDENT);
    }
    
    /**
     * Convert User entity to UserDto
     */
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
