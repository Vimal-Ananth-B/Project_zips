package com.backend.kanban.Repository;

import com.backend.kanban.Domain.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    //Optional<Employee> findByEmployeeEmail(String employeeEmail);
    Employee findByEmployeeEmail(String employeeEmail);
    boolean existsByEmployeeEmail(String employeeEmail);

}
