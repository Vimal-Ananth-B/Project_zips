package com.example.userservices.Domain;

public class PasswordUpdateRequest {
    private String email;
    private String newPassword;

    // Default constructor (required for deserialization)
    public PasswordUpdateRequest() {}

    // Parameterized constructor
    public PasswordUpdateRequest(String email, String newPassword) {
        this.email = email;
        this.newPassword = newPassword;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

