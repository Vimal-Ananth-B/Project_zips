package com.backend.kanban.Util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long expirationTime;

    // Extract Email from Token
    public String extractUserId(String token) {
        return getClaims(token).getSubject();
    }

    // Extract Role from Token
    public String extractUserRole(String token) {
        return (String) getClaims(token).get("role");
    }

    public String extractEmailFromToken(String token) {
        token = token.replace("Bearer ", "").trim(); // Ensure proper formatting
        Claims claims = Jwts.parser()
                .setSigningKey(secretKey) // Use configured secretKey
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject(); // Assuming email is stored in subject
    }

    // Validate Token Expiry & Signature
    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Helper: Parse JWT Claims
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody();
    }
}
