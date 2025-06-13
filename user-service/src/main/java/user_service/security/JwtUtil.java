package user_service.security;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    // Base64 encoded 32+ char secret: "mysecretkeymysecretkeymysecretkeymysecretkey"
    private final String jwtSecret = "bXlzZWNyZXRrZXlteXNlY3JldGtleW15c2VjcmV0a2V5bXlzZWNyZXRrZXk=";
    private final long jwtExpirationMs = 86400000; // 1 day
    private final long refreshExpirationMs = 604800000; // 7 days

    private byte[] getSigningKey() {
        return Base64.getDecoder().decode(jwtSecret);
    }

    public String generateToken(String username, String role, Long userId) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS256, getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))                .signWith(SignatureAlgorithm.HS256, getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return false;
            }
            Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;        }
    }

    public String extractUsername(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }        return extractAllClaims(token).get("userId", Long.class);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSigningKey())
                .parseClaimsJws(token)
                .getBody();
    }
}
