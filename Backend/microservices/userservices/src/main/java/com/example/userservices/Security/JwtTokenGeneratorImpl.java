package com.example.userservices.Security;

import com.example.userservices.Domain.Employee;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtTokenGeneratorImpl implements SecurityTokenGenerator {

    private static final String SECRET_KEY = "SecretKey"; // Use same key across services

    @Override
    public String createToken(Employee employee) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", employee.getEmployeeEmail());
        return generateToken(claims, employee.getEmployeeEmail());
    }

    private String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setIssuer("KanbanBoard")
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hour validity
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY) // HS256 for symmetric key
                .compact();
    }
}
