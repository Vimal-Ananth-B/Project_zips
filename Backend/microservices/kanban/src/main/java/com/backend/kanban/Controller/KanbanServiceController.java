package com.backend.kanban.Controller;

import com.backend.kanban.Domain.Employee;
import com.backend.kanban.Domain.Task;
import com.backend.kanban.Domain.TaskNotification;
import com.backend.kanban.Exception.*;
import com.backend.kanban.Proxy.EmployeeProxy;
import com.backend.kanban.Repository.EmployeeRepository;
import com.backend.kanban.Repository.TaskRepository;
import com.backend.kanban.Service.KanbanService;
import com.backend.kanban.Util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.management.Notification;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:5177")
public class KanbanServiceController {

    private final KanbanService kanbanService;
    private final EmployeeProxy employeeProxy;
    private final JwtUtil jwtUtil;
    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;

    @Autowired
    public KanbanServiceController(KanbanService kanbanService, EmployeeProxy employeeProxy, JwtUtil jwtUtil,
                                   EmployeeRepository employeeRepository, TaskRepository taskRepository) {
        this.kanbanService = kanbanService;
        this.employeeProxy = employeeProxy;
        this.jwtUtil = jwtUtil;
        this.employeeRepository = employeeRepository;
        this.taskRepository = taskRepository;
    }

//    @PostMapping("/register")
//    public ResponseEntity<?> saveEmployee(@RequestBody Employee employee) throws EmployeeAlreadyExistsException {
//        try {
//            return new ResponseEntity<>(kanbanService.registerEmployee(employee), HttpStatus.CREATED);
//        } catch (EmployeeAlreadyExistsException e) {
//            throw new EmployeeAlreadyExistsException();
//        } catch(Exception e){
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR("The error occured while regsitering the employee."))
//        }
//    }

    @PostMapping("/register")
    public ResponseEntity<?> saveEmployee(@RequestBody Employee employee) throws EmployeeAlreadyExistsException {
        // Check if email is valid before proceeding
        if (!kanbanService.isValidEmail(employee.getEmployeeEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or non-existent email.");
        }

        try {
            return new ResponseEntity<>(kanbanService.registerEmployee(employee), HttpStatus.CREATED);
        } catch (EmployeeAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Employee with this email already exists.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while registering the employee.");
        }
    }

    // Extract and Validate Token
    private String extractAndValidateToken(HttpServletRequest request) throws UnauthorizedException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid token.");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new UnauthorizedException("Invalid or expired token.");
        }

        return jwtUtil.extractUserId(token);
    }

    @GetMapping("/tasks")
    public ResponseEntity<?> getAllTasks(HttpServletRequest request) {
        try {
            extractAndValidateToken(request); // Token validation
            return ResponseEntity.ok(kanbanService.getAllTasks());
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable("id") int id,HttpServletRequest request)
    {
        System.out.println("Fetching task with ID:" +id);
        try{
            extractAndValidateToken(request);
            Task task=kanbanService.getTaskById(id);
            System.out.println("Task Found : "+task);
            return ResponseEntity.ok(task);
        }
        catch(TaskNotFoundException e)
        {
            return new ResponseEntity<>(e.getMessage(),HttpStatus.NOT_FOUND);
        }
        catch(UnauthorizedException e)
        {
            return new ResponseEntity<>(e.getMessage(),HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<Task>> getMyTasks(@RequestHeader("Authorization") String token){
        String email = extractEmailFromToken(token);
        List<Task> tasks = kanbanService.getTaskByEmployeeEmail(email);
        return ResponseEntity.ok(tasks);
    }

    private String extractEmailFromToken(String token){
        token = token.replace("Bearer","");
        Claims claims = Jwts.parser()
                .setSigningKey("SecretKey")
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

//    @GetMapping("/my-notifications")
//    public ResponseEntity<List<String>> getMyNotifications(@RequestHeader("Authorization") String token) {
//        String email = extractEmailFromToken(token);
//        List<Map<String,String>> notifications = kanbanService.getNotificationsForEmployee(email);
//        List<String> notificationMessages = notifications.stream()
//                .map(map -> map.get("message")) // Adjust key name if different
//                .toList();
//
//        return ResponseEntity.ok(notificationMessages);
//    }

//    @GetMapping("/my-notifications")
//    public ResponseEntity<List<TaskNotification>> getMyNotifications(@RequestHeader("Authorization") String token) {
//        String email = extractEmailFromToken(token); // Extract user email from token
//
//        List<Task> tasks;
//
//        // ✅ Check if the user is an admin
//        if (isAdmin(email)) {
//            tasks=taskRepository.findAll(); // Fetch all notifications for admin
//        } else {
//            tasks=taskRepository.findByAssignedEmployeesContaining(email); // Fetch only employee's notifications
//        }
//
//        List<TaskNotification> notificationMessages = tasks.stream()
//                .flatMap(task -> task.getTaskNotifications().stream())
//                .toList();
//
//        return ResponseEntity.ok(notificationMessages);
//    }

    @GetMapping("/my-notifications")
    public ResponseEntity<List<TaskNotification>> getMyNotifications(@RequestHeader("Authorization") String token) {
        String email = extractEmailFromToken(token);

        List<Task> tasks = taskRepository.findAll();

        List<TaskNotification> notificationMessages = tasks.stream()
                .map(Task::getTaskNotifications)  // Get notifications from each task
                .filter(Objects::nonNull)         // Ensure we don't process null values
                .flatMap(List::stream)            // Flatten the lists
                .filter(notification -> notification.getChangeDescription() != null && !notification.getChangeDescription().isBlank())
                .filter(notification -> !notification.getChangeDescription().contains("Last Updated timestamp updated"))
                .filter(notification -> !notification.getChangeDescription().contains("Task Updated with ID"))
                .toList();

        return ResponseEntity.ok(notificationMessages);
    }


    public boolean isAdmin(String email) {
        Employee employee = employeeRepository.findByEmployeeEmail(email);
        return employee != null && "ADMIN".equalsIgnoreCase(employee.getEmployeeRole());
    }







    @GetMapping("/getAllEmployees")
    public ResponseEntity<?> getAllEmployees(HttpServletRequest request)
    {
        try{
            extractAndValidateToken(request);
            return ResponseEntity.ok(kanbanService.getAllEmployees());
        }
        catch(UnauthorizedException e)
        {
            return new ResponseEntity<>(e.getMessage(),HttpStatus.UNAUTHORIZED);
        }

    }
    @GetMapping("/name")
    public ResponseEntity<String> getEmployeeName(@RequestParam String email) {
        try {
            String employeeName = kanbanService.getEmployeeName(email);
            return ResponseEntity.ok(employeeName);
        } catch (EmployeeNotFoundException e) {
            return ResponseEntity.status(404).body("Employee not found");
        }
    }

    @PostMapping("/createTask")
    public ResponseEntity<?> createTaskWithAssignments(@RequestBody Task task, HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if(authHeader == null || !authHeader.startsWith("Bearer ")){
                return new ResponseEntity<>("Missing or invalid Authorization header",HttpStatus.UNAUTHORIZED);// Token validation
            }
            String token=authHeader.substring(7);
            String userEmail=extractEmailFromToken(token);
            Task newTask = kanbanService.createTaskWithAssignments(task,token);

            newTask.addNotification(userEmail,"Task Created with ID:"+newTask.getTaskId());
            return new ResponseEntity<>(newTask, HttpStatus.CREATED);
        } catch (TaskAlreadyExistsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (EmployeeNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/employee/{email}")
    public ResponseEntity<?> getEmployeeByEmail(@PathVariable String email) {
        try {
            Employee employee = kanbanService.getEmployeeByEmail(email);
            return ResponseEntity.ok(employee);
        } catch (EmployeeNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/updateTask/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable int taskId, @RequestBody Task task, HttpServletRequest request) {
        try {
            // Extract token from request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract user email
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userEmail = extractEmailFromToken(token);

            // Call service to update task
            Task updatedTask = kanbanService.updateTask(taskId, task, request);

            // Add notification with extracted user email
            updatedTask.addNotification(userEmail, "Task Updated with ID " + updatedTask.getTaskId());

            return new ResponseEntity<>(updatedTask, HttpStatus.OK);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/deleteTask/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable int taskId, HttpServletRequest request) {
        try {
            // Extract token from request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract user email
            String token = authHeader.substring(7);
            String userEmail = extractEmailFromToken(token);

            // Call service to delete task
            kanbanService.deleteTask(taskId,request);

            // Return response with user email info
            return new ResponseEntity<>("Task deleted successfully by " + userEmail, HttpStatus.OK);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @PutMapping("/updateStatus/{taskId}/{newStatus}")
    public ResponseEntity<?> updateTaskStatus(@PathVariable int taskId, @PathVariable String newStatus, HttpServletRequest request) {
        try {
            // Extract token from request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract user email
            String token = authHeader.substring(7);
            String userEmail = extractEmailFromToken(token);

            // Call service to update task status
            Task updatedTask = kanbanService.updateTaskStatusDND(taskId, newStatus,request);

            // Add notification with extracted user email
            updatedTask.addNotification(userEmail, "Task Status Updated to " + newStatus);

            return new ResponseEntity<>(updatedTask, HttpStatus.OK);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }


    @PostMapping("/forgotPassword")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String employeeEmail = request.get("employeeEmail");

        // Log received request for debugging
        System.out.println("Received Forgot Password request for email: " + employeeEmail);

        if (employeeEmail == null || employeeEmail.isEmpty()) {
            System.out.println("Error: Missing email in request body");
            return ResponseEntity.badRequest().body("Missing email in request body");
        }

        boolean success = kanbanService.sendOtpToEmail(employeeEmail);
        if (!success) {
            System.out.println("Error: Email not found in database: " + employeeEmail);
            return ResponseEntity.badRequest().body("Email not registered");
        }

        return ResponseEntity.ok("OTP sent to email.");
    }

    @PutMapping("/resetPassword")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String employeeEmail = request.get("employeeEmail");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        boolean updated = kanbanService.verifyOtpAndResetPassword(employeeEmail, otp, newPassword);
        return updated ? ResponseEntity.ok("Password updated successfully.")
                : ResponseEntity.badRequest().body("Invalid OTP or expired.");
    }


    @PutMapping("/archiveTask/{taskId}")
    public ResponseEntity<?> archiveTask(@PathVariable int taskId, HttpServletRequest request) {
        try {
            // Extract token from request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract user email from token
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userEmail = extractEmailFromToken(token);

            // Fetch task
            Task task = kanbanService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found.");
            }

            // Archive task
            task.setTaskStatus("archived",userEmail);
            kanbanService.updateTask(taskId, task, request);

            // Add notification about task archival
            task.addNotification(userEmail, "Task archived with ID " + taskId);

            return ResponseEntity.ok("Task archived successfully by " + userEmail);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while archiving the task.", HttpStatus.INTERNAL_SERVER_ERROR);
}
}

    @GetMapping("/archivedTasks")
    public ResponseEntity<List<Task>> getArchivedTasks(HttpServletRequest request) {
        try {
            extractAndValidateToken(request); // ✅ Validate JWT token
            List<Task> archivedTasks = kanbanService.getArchivedTasks();
            return ResponseEntity.ok(archivedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
}
}

    @PutMapping("/restoreTask/{taskId}")
    public ResponseEntity<?> restoreTask(@PathVariable int taskId, HttpServletRequest request) {
        try {
            // Extract token from request header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return new ResponseEntity<>("Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            // Extract user email from token
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String userEmail = extractEmailFromToken(token);

            // Fetch task
            Task task = kanbanService.getTaskById(taskId);
            if (task == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found.");
            }

            // Check if the task is actually archived
            if (!"archived".equals(task.getTaskStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Task is not archived.");
            }

            // Restore the task
            task.setTaskStatus("todo",userEmail);
            kanbanService.updateTask(taskId, task, request);

            // Add notification about task restoration
            task.addNotification(userEmail, "Task restored with ID " + taskId);

            return ResponseEntity.ok("Task restored successfully by " + userEmail);
        } catch (TaskNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (UnauthorizedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while restoring the task.", HttpStatus.INTERNAL_SERVER_ERROR);
}
}

}
