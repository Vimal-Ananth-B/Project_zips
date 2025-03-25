package com.example.userservices.Security;

import com.example.userservices.Domain.Employee;

public interface SecurityTokenGenerator {
    String createToken(Employee employee);
}
