package com.backend.kanban.Repository;

import com.backend.kanban.Domain.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, Integer> {
    List<Task> findByTaskStatus(String taskStatus);
    List<Task> findByAssignedEmployees(String email);
    List<Task> findByAssignedEmployeesContaining(String email);
}
