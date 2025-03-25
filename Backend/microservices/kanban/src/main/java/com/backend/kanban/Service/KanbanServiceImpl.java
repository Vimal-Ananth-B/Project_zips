package com.backend.kanban.Service;

import com.backend.kanban.Domain.Employee;
import com.backend.kanban.Domain.PasswordUpdateRequest;
import com.backend.kanban.Domain.Task;
import com.backend.kanban.Exception.*;
import com.backend.kanban.Proxy.EmployeeProxy;
import com.backend.kanban.Repository.EmployeeRepository;
import com.backend.kanban.Repository.TaskRepository;
import com.backend.kanban.Util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service

public class KanbanServiceImpl implements KanbanService {

    private final EmployeeRepository employeeRepository;
    private final TaskRepository taskRepository;
    private final EmployeeProxy employeeProxy; // Inject Feign Client
    private final JwtUtil jwtUtil;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    public KanbanServiceImpl(EmployeeRepository employeeRepository, TaskRepository taskRepository, EmployeeProxy employeeProxy,JwtUtil jwtUtil) {
        this.employeeRepository = employeeRepository;
        this.taskRepository = taskRepository;
        this.employeeProxy = employeeProxy;
        this.jwtUtil = jwtUtil;
    }
    @Autowired
    public JavaMailSender javaMailSender;
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final List<Map<String,String>> notifications = new LinkedList<>();


    public Map<String,String> resetTokens = new HashMap<>();
    @Value("${mailboxlayer.api.key}")
    private String apiKey;

    // **Register new Employee and send to UserService**

    @Override
    public Employee registerEmployee(Employee employee) throws EmployeeAlreadyExistsException {
        if (employeeRepository.findById(employee.getEmployeeEmail()).isPresent()) {
            throw new EmployeeAlreadyExistsException();
        }
        employee.setEmployeePassword(passwordEncoder.encode(employee.getEmployeePassword()));
        // Save Employee in Kanban DB
        Employee savedEmployee = employeeRepository.save(employee);

        // Call UserService via Feign Client to save the Employee
        ResponseEntity<?> userServiceResponse = employeeProxy.saveEmployee(savedEmployee);


        return savedEmployee;
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Employee getEmployeeByEmail(Employee employee) throws EmployeeNotFoundException {
        return employeeRepository.findById(employee.getEmployeeEmail())
                .orElseThrow(EmployeeNotFoundException::new);
    }

    @Override
    public String getEmployeeName(String employeeEmail) throws EmployeeNotFoundException {
        Employee employee = employeeRepository.findByEmployeeEmail(employeeEmail);

        if (employee != null) {
            return employee.getEmployeeName();
        } else {
            throw new EmployeeNotFoundException();
        }
    }


    @Override
    public List<Task> getTaskByEmployeeEmail(String email) {
        return taskRepository.findByAssignedEmployees(email);
    }


    @Override
    public Task createTaskWithAssignments(Task task,String token) throws TaskAlreadyExistsException,EmployeeNotFoundException {

       //Check if Task Already Exists
        if(taskRepository.existsById(task.getTaskId())){
            throw new TaskAlreadyExistsException();
        }


        //Validate Employee Assignments
        if(task.getAssignedEmployees().size() > 3){
            throw new IllegalArgumentException("A task can only be assigned to a maximum of 3 employees.");
        }

        //Validate the employees exist
        List<Employee> employees = employeeRepository.findAllById(task.getAssignedEmployees());
        if(employees.size() != task.getAssignedEmployees().size()){
            throw new EmployeeNotFoundException();
        }

        List<String> employeesEmailList = employees.stream()
                .map(Employee::getEmployeeEmail)
                .collect(Collectors.toList());



        Task newTask = new Task(
                task.getTaskId(),
                task.getTaskTitle(),
                task.getTaskDescription(),
                task.getTaskPriority(),
                task.getTaskStatus(),
                task.getTaskProgress(),
                task.getTaskComments(),
                employeesEmailList,
                task.getTaskAssignedDate(),
                task.getTaskDeadlineDate(),
                LocalDateTime.now().withNano(0),
                LocalDateTime.now().withNano(0));

        Task savedTask=taskRepository.save(newTask);
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("JWT Token is missing or empty");
        } // Extract token from security context
        String userEmail = jwtUtil.extractEmailFromToken(token); // Extract email from JWT
        savedTask.addNotification(userEmail,"Task Created with ID"+task.getTaskId());
        return savedTask;

    }

    @Override
    public boolean isValidEmail(String email){
        try {
            String url = "https://apilayer.net/api/check?access_key=" + apiKey + "&email=" + email + "&format=1";
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            // Convert response string to Map using Jackson
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> jsonResponse = objectMapper.readValue(response, Map.class);

            // Extract email verification details
            boolean isValidFormat = (boolean) jsonResponse.get("format_valid");
            boolean isSMTPValid = (boolean) jsonResponse.get("smtp_check");
            boolean isDisposable = (boolean) jsonResponse.get("disposable");

            // Ensure the email is well-formed, exists, and is not from a disposable provider
            return isValidFormat && isSMTPValid && !isDisposable;
        } catch (Exception e) {
            return false; // If API fails, assume invalid email
        }
    }

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task getTaskById(int taskId) throws TaskNotFoundException {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task with ID " + taskId + " not found"));
    }

//    @Override
//    public Task createTask(Task task, List<Employee> assignedEmployees) throws TaskAlreadyExistsException {
//        if (taskRepository.findById(task.getTaskId()).isPresent()) {
//            throw new TaskAlreadyExistsException();
//        }
//
//        task.setAssignedEmployees(assignedEmployees);
//        return taskRepository.save(task);
//    }

    @Override
    public Task updateTask(int taskId, Task task,HttpServletRequest request) throws TaskNotFoundException {
        Task updatedTask = taskRepository.findById(taskId)
                .orElseThrow(TaskNotFoundException::new);

        StringBuilder changes = new StringBuilder();
        // ✅ Extract JWT token from request header
        String token = extractTokenFromRequest(request);
        String userEmail = "Unknown User"; // Default value

        if (token != null && !token.isEmpty()) {
            try {
                userEmail = jwtUtil.extractEmailFromToken(token); // Extract user email from JWT
            } catch (Exception e) {
                System.out.println("Failed to extract user email: " + e.getMessage());
            }
        }

        if (!Objects.equals(updatedTask.getTaskTitle(), task.getTaskTitle())) {
            updatedTask.setTaskTitle(task.getTaskTitle(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskDescription(), task.getTaskDescription())) {
            updatedTask.setTaskDescription(task.getTaskDescription(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskPriority(), task.getTaskPriority())) {
            updatedTask.setTaskPriority(task.getTaskPriority(), userEmail);
        }

        if (updatedTask.getTaskProgress() != task.getTaskProgress()) {
            updatedTask.setTaskProgress(task.getTaskProgress(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskStatus(), task.getTaskStatus())) {
            updatedTask.setTaskStatus(task.getTaskStatus(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskComments(), task.getTaskComments())) {
            updatedTask.setTaskComments(task.getTaskComments(), userEmail);
        }

        if (!Objects.equals(updatedTask.getAssignedEmployees(), task.getAssignedEmployees())) {
            updatedTask.setAssignedEmployees(task.getAssignedEmployees(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskAssignedDate(), task.getTaskAssignedDate())) {
            updatedTask.setTaskAssignedDate(task.getTaskAssignedDate(), userEmail);
        }

        if (!Objects.equals(updatedTask.getTaskDeadlineDate(), task.getTaskDeadlineDate())) {
            updatedTask.setTaskDeadlineDate(task.getTaskDeadlineDate(), userEmail);
        }

        LocalDateTime now=LocalDateTime.now().withNano(0);

        updatedTask.setLastUpdated(now, userEmail);

        Task savedTask=taskRepository.save(updatedTask);

        if(Duration.between(updatedTask.getLastUpdated(),now).toMinutes()<=3){
            savedTask.addNotification(userEmail, changes.toString());
        }

        return savedTask;
    }

    /**
     * Extracts JWT token from request header.
     */

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Remove "Bearer " prefix
        }
        return null;
    }



    @Override
    public boolean deleteTask(int taskId,HttpServletRequest request) throws TaskNotFoundException {
        Task task=taskRepository.findById(taskId)
                        .orElseThrow(()-> new TaskNotFoundException("Task not found"));
        // ✅ Extract user email from JWT token in request
        String token = extractTokenFromRequest(request);
        String userEmail = "Unknown User";

        if (token != null && !token.isEmpty()) {
            try {
                userEmail = jwtUtil.extractEmailFromToken(token);
            } catch (Exception e) {
                System.out.println("Failed to extract user email: " + e.getMessage());
            }
        }
        taskRepository.deleteById(taskId);

        task.addNotification(userEmail,"Task ID:"+taskId+"Deleted");
        return true;
    }



    @Override
    public Task updateTaskStatusDND(int taskId,String newStatus,HttpServletRequest request) throws TaskNotFoundException, UnauthorizedException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(TaskNotFoundException::new);

        // Extract user email from JWT token
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new UnauthorizedException("Invalid or missing token");
        }
        String userEmail = jwtUtil.extractEmailFromToken(token);

        task.setTaskStatus(newStatus,userEmail);
        Task updatedTask = taskRepository.save(task);

        // Add notification for status update
        updatedTask.addNotification(userEmail, "Task status changed to " + newStatus);

        return updatedTask;
    }

    @Override
    public Employee getEmployeeByEmail(String email) throws EmployeeNotFoundException {
        return employeeRepository.findById(email)
                .orElseThrow(EmployeeNotFoundException::new);
    }

    @Override
    public List<Map<String, String>> getNotificationsForEmployee(String email) {
        Employee employee = employeeRepository.findByEmployeeEmail(email);
        if (employee == null) {
            return new ArrayList<>();
        }

        synchronized (notifications) {
            if (employee.getEmployeeRole().equalsIgnoreCase("admin")) {
                return new ArrayList<>(notifications); // Admin gets all notifications
            } else {
                return notifications.stream()
                        .filter(notification -> notification.get("message").contains(email))
                        .collect(Collectors.toList()); // Employees get only their notifications
            }
        }
    }



    @Override
    public boolean sendPasswordResetLink(String employeeEmail){
        Employee employee = employeeRepository.findByEmployeeEmail(employeeEmail);
        if(employee == null) return false; //Email not registered

        String token = UUID.randomUUID().toString();
        resetTokens.put(token,employeeEmail);//store token

        //Send reset email
        String resetLink = "http://localhost:5177/resetPassword?token=" + token;
        sendEmail(employeeEmail,"Reset Your Password","Click here to reset:" + resetLink);

        return true;
    }



    @Override
    public boolean updatePassword(String token, String newPassword) {
        String employeeEmail = resetTokens.get(token);
        if (employeeEmail == null) return false; // Invalid token

        Employee employee = employeeRepository.findByEmployeeEmail(employeeEmail);
        if (employee == null) return false; // User not found

        // Hash the new password before saving in KanbanService
        String hashedPassword = passwordEncoder.encode(newPassword);
        employee.setEmployeePassword(hashedPassword);
        employeeRepository.save(employee);

        // Call UserService to update the password in the UserService database
        PasswordUpdateRequest request = new PasswordUpdateRequest(employeeEmail, hashedPassword);
        try {
            employeeProxy.updatePassword(request);
        } catch (Exception e) {
            System.out.println("Error updating password in UserService: " + e.getMessage());
            return false;
        }

        resetTokens.remove(token);
        return true;
    }


    @Override
    public boolean sendOtpToEmail(String employeeEmail) {
        Optional<Employee> employee = employeeRepository.findById(employeeEmail);
        if (employee.isEmpty()) {
            return false; // Email not found
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit OTP
        otpStorage.put(employeeEmail, otp);

        sendEmail(employeeEmail, "Password Reset OTP", "Your OTP is: " + otp);
        return true;
    }

    public boolean verifyOtpAndResetPassword(String employeeEmail, String otp, String newPassword) {
        String storedOtp = otpStorage.get(employeeEmail);

        // Check if OTP is valid
        if (storedOtp == null || !storedOtp.equals(otp)) {
            System.out.println("Invalid or expired OTP for email: " + employeeEmail);
            return false;
        }

        // Fetch employee from MongoDB
        Employee employee = employeeRepository.findById(employeeEmail).orElse(null);
        if (employee == null) {
            System.out.println("User not found for email: " + employeeEmail);
            return false;
        }

        // Hash the new password before saving
        String hashedPassword = passwordEncoder.encode(newPassword);
        employee.setEmployeePassword(hashedPassword);

        try {
            // Update password in MongoDB (KanbanService)
            employeeRepository.save(employee);
            System.out.println("Password updated in KanbanService for: " + employeeEmail);
        } catch (Exception e) {
            System.out.println("Error saving password in KanbanService: " + e.getMessage());
            return false;
        }

        // Call UserService to update the password in MySQL
        PasswordUpdateRequest request = new PasswordUpdateRequest(employeeEmail, hashedPassword);
        try {
            employeeProxy.updatePassword(request);
            System.out.println("Password successfully updated in UserService for: " + employeeEmail);
        } catch (Exception e) {
            System.out.println("Error updating password in UserService: " + e.getMessage());
            return false;
        }

        // Remove OTP after successful password reset
        otpStorage.remove(employeeEmail);
        System.out.println("OTP removed for email: " + employeeEmail);

        return true;
    }

    // Helper: Send Email
    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        javaMailSender.send(message);
    }


    @Override
    public void archiveTask(int taskId,HttpServletRequest request) throws TaskNotFoundException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException());

        // ✅ Extract user email from JWT token in request
        String token = extractTokenFromRequest(request);
        String userEmail = "Unknown User";

        if (token != null && !token.isEmpty()) {
            try {
                userEmail = jwtUtil.extractEmailFromToken(token);
            } catch (Exception e) {
                System.out.println("Failed to extract user email: " + e.getMessage());
            }
        }

        task.setTaskStatus("archived",userEmail);
        task.setLastUpdated(LocalDateTime.now(),userEmail);// ✅ Instead of deleting, we change status to "archived"
        taskRepository.save(task);

        task.addNotification("Changes done by:"+userEmail,"Task Id:"+taskId+" Is Archived");
    }
    @Override
    public Task restoreTask(int taskId,HttpServletRequest request) throws TaskNotFoundException {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        if (!"archived".equals(task.getTaskStatus())) {
            throw new IllegalStateException("Task is not archived.");
        }

        // ✅ Extract user email from JWT token in request
        String token = extractTokenFromRequest(request);
        String userEmail = "Unknown User";

        if (token != null && !token.isEmpty()) {
            try {
                userEmail = jwtUtil.extractEmailFromToken(token);
            } catch (Exception e) {
                System.out.println("Failed to extract user email: " + e.getMessage());
            }
        }

        task.setTaskStatus("todo",userEmail); // ✅ Restore task back to "To Do"
        task.setLastUpdated(LocalDateTime.now(),userEmail);
        Task restoredTask = taskRepository.save(task);

        // Notify Task Restoration
        task.addNotification("The user:"+userEmail,"The taskid:"+taskId+"is Restored");
        return taskRepository.save(task);
    }
    @Override
    public List<Task> getArchivedTasks() {
        List<Task> archivedTasks = taskRepository.findByTaskStatus("archived");
        return archivedTasks.isEmpty() ? new ArrayList<>() : archivedTasks; //
}

//    @Transactional // Ensure rollback if failure occurs
//    public void updateEmployeePassword(String employeeEmail,String newPassword){
//        try{
//            PasswordUpdateRequest request = new PasswordUpdateRequest(employeeEmail,newPassword);
//            // Call Userservice to update password
//            ResponseEntity<String> response = employeeProxy.updatePassword(request);
//
//            if(response.getStatusCode() != HttpStatus.OK){
//                throw new RuntimeException("UserService failed to update password");
//
//            }
//
//            // Only update local database if userservie is successful
//            Employee employee = employeeRepository.findByEmployeeEmail(employeeEmail);
//            if(employee != null){
//                employee.setEmployeePassword(passwordEncoder.encode(newPassword));
//                employeeRepository.save(employee);
//            }
//
//        }catch (FeignException e){
//            throw new RuntimeException("UserService is down or failed:"+ e.getMessage());
//        }
//    }
}
