package user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import user_service.entity.Role;

@Data
public class OAuth2LoginRequest {
    @NotBlank(message = "Google ID token is required")
    private String idToken;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String firstName;
    private String lastName;
    private String profileImage;
    
    // Role selection for new users - defaults to STUDENT if not provided
    private Role role;
}
