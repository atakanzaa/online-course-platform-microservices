package user_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import user_service.dto.AuthResponse;
import user_service.dto.LoginRequest;
import user_service.dto.OAuth2LoginRequest;
import user_service.dto.RegisterRequest;
import user_service.service.OAuth2Service;
import user_service.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    
    @Autowired(required = false)
    private OAuth2Service oauth2Service;
    
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }
    
    @PostMapping("/oauth2/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody OAuth2LoginRequest request) {
        if (oauth2Service == null) {
            throw new RuntimeException("OAuth2 service is not configured");
        }
        return ResponseEntity.ok(oauth2Service.googleLogin(request));
    }
}