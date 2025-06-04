package user_service.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import user_service.dto.AuthResponse;
import user_service.dto.OAuth2LoginRequest;
import user_service.entity.Role;
import user_service.entity.User;
import user_service.repository.UserRepository;
import user_service.security.JwtUtil;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OAuth2Service {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Transactional
    public AuthResponse googleLogin(OAuth2LoginRequest request) {
        try {
            // Verify Google ID token
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), 
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            
            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new RuntimeException("Invalid Google ID token");
            }
            
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            
            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            
            User user;
            if (existingUser.isPresent()) {
                // Update existing user's profile image if provided
                user = existingUser.get();
                if (pictureUrl != null && !pictureUrl.isEmpty()) {
                    user.setProfileImage(pictureUrl);
                    userRepository.save(user);
                }
            } else {
                // Create new user
                String[] nameParts = name.split(" ", 2);
                String firstName = nameParts.length > 0 ? nameParts[0] : name;
                String lastName = nameParts.length > 1 ? nameParts[1] : "";
                
                // Use provided role or default to STUDENT
                Role userRole = request.getRole() != null ? request.getRole() : Role.STUDENT;
                
                user = User.builder()
                        .username(email) // Use email as username for OAuth2 users
                        .email(email)
                        .password("") // OAuth2 users don't have password
                        .firstName(firstName)
                        .lastName(lastName)
                        .profileImage(pictureUrl)
                        .role(userRole)
                        .build();
                userRepository.save(user);
            }
            
            // Generate tokens
            String accessToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
            
            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .build();
                    
        } catch (GeneralSecurityException | IOException e) {
            log.error("Error verifying Google ID token", e);
            throw new RuntimeException("Failed to verify Google ID token");
        }
    }
}
