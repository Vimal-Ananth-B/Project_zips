package com.example.userservices.Service;

import com.example.userservices.Domain.Employee;
import com.example.userservices.Exception.EmployeeAlreadyExistsException;
import com.example.userservices.Exception.InvalidCredentialException;
import com.example.userservices.Repository.EmployeeRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.config.Task;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class EmployeeServiceImpl implements EmployeeService{

    private EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository,PasswordEncoder passwordEncoder){
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Autowired
    public PasswordEncoder passwordEncoder;

    @Override
    public Employee saveEmployee(Employee employee) throws EmployeeAlreadyExistsException{
        if(employeeRepository.findById(employee.getEmployeeEmail()).isPresent())
        {
            throw new EmployeeAlreadyExistsException("Exception with EmployeeAlreadyExistsException");
        }
        return employeeRepository.save(employee);
    }

    @Override
    public Employee findByEmployeeEmail(String employeeEmail) throws InvalidCredentialException {
        Employee loggedInUser = employeeRepository.findByEmployeeEmail(employeeEmail);
        if(loggedInUser == null){
            throw new InvalidCredentialException("Exception with Invalid credentials");
        }
        return loggedInUser;

    }


    @Override
    public boolean doesEmployeeExists(String employeeEmail){
        return employeeRepository.existsById(employeeEmail);
    }

    @Override
    public boolean updatePassword(String email, String newPassword) {
        Employee employee = employeeRepository.findByEmployeeEmail(email);
        if (employee == null) return false; // User not found

        // Hash the new password before saving
        employee.setEmployeePassword(newPassword);
        employeeRepository.save(employee);

        return true;
    }

}
