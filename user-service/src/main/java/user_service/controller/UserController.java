package user_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import user_service.dto.UpdateProfileRequest;
import user_service.entity.User;
import user_service.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getByUsernameOrEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                           @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.getByUsernameOrEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        userService.updateProfile(user.getId(), request);
        return ResponseEntity.ok().build();
    }
} 