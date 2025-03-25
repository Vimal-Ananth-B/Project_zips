package com.backend.kanban.Service;

import com.backend.kanban.Domain.Employee;
import com.backend.kanban.Domain.Task;
import com.backend.kanban.Exception.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

public interface KanbanService {

    // Register a new employee
    Employee registerEmployee(Employee employee) throws EmployeeAlreadyExistsException;

    // Create a new task and assign employees to it
    Task createTaskWithAssignments(Task task,String token) throws TaskAlreadyExistsException,EmployeeNotFoundException;

    // Update task progress and status
//    Task updateTask(int taskId,Task task ) throws TaskNotFoundException;
    Task updateTask(int taskId, Task task, HttpServletRequest request) throws TaskNotFoundException;
    // Delete a task by ID
    boolean deleteTask(int taskId,HttpServletRequest request) throws TaskNotFoundException;

//    Update task status while DND
    Task updateTaskStatusDND(int taskId,String newStatus,HttpServletRequest request) throws TaskNotFoundException, UnauthorizedException;
    // Get all employees
    List<Employee> getAllEmployees();

    // Get all tasks
    List<Task> getAllTasks();

    // Get an employee by email
    Employee getEmployeeByEmail(Employee employee) throws EmployeeNotFoundException;

    // Get a task by ID
    Task getTaskById(int taskId) throws TaskNotFoundException;

    public List<Task> getArchivedTasks();
    public Task restoreTask(int taskId,HttpServletRequest request) throws TaskNotFoundException;
    public void archiveTask(int taskId,HttpServletRequest request) throws TaskNotFoundException;

    String getEmployeeName(String employeeEmail) throws EmployeeNotFoundException;
//    void sendEmail(String to,String subject,String body);
//    boolean updatePassword(String token,String newPassword);
//    boolean sendPasswordResetLink(String employeeEmail);
    Employee getEmployeeByEmail(String email) throws EmployeeNotFoundException;
    List<Task> getTaskByEmployeeEmail(String email);
    boolean isValidEmail(String email);
    List<Map<String, String>> getNotificationsForEmployee(String email);
    // Assign an existing task to an employee
//    Employee assignTaskToEmployee(String employeeEmail,Task tsk)
//            throws EmployeeNotFoundException, TaskNotFoundException;

    public boolean sendOtpToEmail(String employeeEmail);
    public boolean verifyOtpAndResetPassword(String employeeEmail, String otp, String newPassword);
    public void sendEmail(String to, String subject, String body);
    public boolean sendPasswordResetLink(String employeeEmail);
    public boolean updatePassword(String token, String newPassword);

}
