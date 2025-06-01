package user_service.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String firstName;
    private String lastName;
    private String password;
    private String profileImage;
} 