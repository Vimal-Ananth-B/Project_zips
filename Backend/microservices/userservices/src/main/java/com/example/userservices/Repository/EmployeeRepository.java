package com.example.userservices.Repository;

import com.example.userservices.Domain.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee,String> {
    Employee findByEmployeeEmailAndEmployeePassword(String employeeEmail,String employeePassword);
    Employee findByEmployeeEmail(String employeeEmail);


}
