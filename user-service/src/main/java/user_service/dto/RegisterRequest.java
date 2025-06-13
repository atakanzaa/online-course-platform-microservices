package user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import user_service.entity.Role;

@Data
public class RegisterRequest {
    // Username is optional - will be auto-generated from email if not provided
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String firstName;
    private String lastName;
    
    // Role selection - defaults to STUDENT if not provided
    private Role role;
}