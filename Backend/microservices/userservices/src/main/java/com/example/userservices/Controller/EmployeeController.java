package com.example.userservices.Controller;

import com.example.userservices.Domain.Employee;
import com.example.userservices.Domain.PasswordUpdateRequest;
import com.example.userservices.Exception.EmployeeAlreadyExistsException;
import com.example.userservices.Exception.InvalidCredentialException;
import com.example.userservices.Security.SecurityTokenGenerator;
import com.example.userservices.Service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5177")
public class EmployeeController {
    private final EmployeeService employeeService;
    private final SecurityTokenGenerator securityTokenGenerator;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    public EmployeeController(EmployeeService employeeService, SecurityTokenGenerator securityTokenGenerator) {
        this.employeeService = employeeService;
        this.securityTokenGenerator = securityTokenGenerator;
    }

    @PostMapping("/register")
    public ResponseEntity<?> saveEmployee(@RequestBody Employee employee) throws EmployeeAlreadyExistsException {
        if (employeeService.doesEmployeeExists(employee.getEmployeeEmail())) {
            throw new EmployeeAlreadyExistsException("Exception with EmployeeAlreadyExistsException");
        }
        Employee registeredEmployee = employeeService.saveEmployee(employee);
        return new ResponseEntity<>(registeredEmployee, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginEmployee(@RequestBody Employee employee) throws InvalidCredentialException {
        Employee existingEmployee = employeeService.findByEmployeeEmail(employee.getEmployeeEmail());

        // Check if the employee exists
        if (existingEmployee == null) {
            throw new InvalidCredentialException("Invalid email or password.");
        }

        // Validate password using passwordEncoder
        if (!passwordEncoder.matches(employee.getEmployeePassword(), existingEmployee.getEmployeePassword())) {
            throw new InvalidCredentialException("Invalid email or password.");
        }

        // Validate role (ensure correct role is used for login)
        String expectedRole = employee.getEmployeeRole(); // Role user is trying to login with
        String actualRole = existingEmployee.getEmployeeRole(); // Role in DB

        if (!actualRole.equalsIgnoreCase("admin") && !actualRole.equalsIgnoreCase("employee")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Unauthorized role.");
        }

        // Prevent employees from logging in as admin
        if (!actualRole.equalsIgnoreCase(expectedRole)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid role for this email. Please login with the correct role.");
        }

        // Generate a JWT token
        String token = securityTokenGenerator.createToken(existingEmployee);

        // Prepare response data
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("message", "Login Successful.");
        response.put("email", existingEmployee.getEmployeeEmail());
        response.put("role", existingEmployee.getEmployeeRole());
        response.put("employeeName", existingEmployee.getEmployeeName());

        return ResponseEntity.ok(response);
    }


    @PutMapping("/resetPassword")
    public ResponseEntity<Map<String, String>> updatePassword(@RequestBody PasswordUpdateRequest request) {
        System.out.println("Received password reset request for: " + request.getEmail());

        if (request.getEmail() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and new password are required."));
        }

        Employee employee = employeeService.findByEmployeeEmail(request.getEmail());
        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Employee not found."));
        }

        // Use the received password directly (since it's already encoded)
        boolean isUpdated = employeeService.updatePassword(request.getEmail(), request.getNewPassword());

        if (!isUpdated) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update password."));
        }

        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }




}
