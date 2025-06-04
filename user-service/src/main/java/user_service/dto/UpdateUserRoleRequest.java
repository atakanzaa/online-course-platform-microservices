package user_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import user_service.entity.Role;

@Data
public class UpdateUserRoleRequest {
    @NotNull(message = "Role is required")
    private Role role;
}
