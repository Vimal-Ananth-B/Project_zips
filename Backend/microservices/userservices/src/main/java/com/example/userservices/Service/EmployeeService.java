package com.example.userservices.Service;

import com.example.userservices.Domain.Employee;
import com.example.userservices.Exception.EmployeeAlreadyExistsException;
import com.example.userservices.Exception.InvalidCredentialException;

public interface EmployeeService {
    Employee saveEmployee(Employee employee) throws EmployeeAlreadyExistsException;
    Employee findByEmployeeEmail(String employeeEmail) throws InvalidCredentialException;
    boolean doesEmployeeExists(String employeeEmail);

    boolean updatePassword(String email, String newPassword);
}
