package com.backend.kanban.Domain;

import jdk.jfr.Description;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document
public class Task {
    @Id
    private int taskId;
    private String taskTitle;
    private String taskDescription;
    private String taskPriority;
    private String taskStatus;
    private int taskProgress;
    private List<String> taskComments;
    private List<String> assignedEmployees;
    private LocalDate taskAssignedDate;
    private LocalDate taskDeadlineDate;
    private LocalDateTime lastCreated;
    private LocalDateTime lastUpdated;
    private List<TaskNotification> taskNotifications;

    public Task(int taskId, String taskTitle, String taskDescription, String taskPriority, String taskStatus,
                int taskProgress, List<String> taskComments, List<String> assignedEmployees,
                LocalDate taskAssignedDate, LocalDate taskDeadlineDate,LocalDateTime lastCreated,LocalDateTime lastUpdated) {
        this.taskId = taskId;
        this.taskTitle = taskTitle;
        this.taskDescription = taskDescription;
        this.taskPriority = taskPriority;
        this.taskStatus = taskStatus;
        this.taskProgress = taskProgress;
        this.taskComments = taskComments;
        this.assignedEmployees = assignedEmployees;
        this.taskAssignedDate = taskAssignedDate;
        this.taskDeadlineDate=taskDeadlineDate;
        this.lastCreated = lastCreated;
        this.lastUpdated = lastUpdated;
        this.taskNotifications=new ArrayList<>();
    }

    public Task() {
        this.lastCreated = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
        this.taskNotifications=new ArrayList<>();
    }

    public void addNotification(String emailId, String changeDescription){
        this.taskNotifications.add(new TaskNotification(emailId,changeDescription,LocalDateTime.now()));
    }

    // Getters and Setters

    public int getTaskId() {
        return taskId;
    }

    public void setTaskId(int taskId, String emailId) {
        addNotification(emailId, "Task ID updated to " + taskId);
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle, String emailId) {
        addNotification(emailId, "Task Title updated to " + taskTitle);
        this.taskTitle = taskTitle;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public void setTaskDescription(String taskDescription, String emailId) {
        addNotification(emailId, "Task Description updated");
        this.taskDescription = taskDescription;
    }

    public String getTaskPriority() {
        return taskPriority;
    }

    public void setTaskPriority(String taskPriority, String emailId) {
        addNotification(emailId, "Task Priority updated to " + taskPriority);
        this.taskPriority = taskPriority;
    }

    public String getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(String taskStatus, String emailId) {
        addNotification(emailId, "Task Status updated to " + taskStatus);
        this.taskStatus = taskStatus;
    }

    public int getTaskProgress() {
        return taskProgress;
    }

    public void setTaskProgress(int taskProgress, String emailId) {
        addNotification(emailId, "Task Progress updated to " + taskProgress);
        this.taskProgress = taskProgress;
    }

    public List<String> getTaskComments() {
        return taskComments;
    }

    public void setTaskComments(List<String> taskComments, String emailId) {
        addNotification(emailId, "Task Comments updated");
        this.taskComments = taskComments;
    }

    public List<String> getAssignedEmployees() {
        return assignedEmployees;
    }

    public void setAssignedEmployees(List<String> assignedEmployees, String emailId) {
        addNotification(emailId, "Assigned Employees updated");
        this.assignedEmployees = assignedEmployees;
    }

    public LocalDate getTaskAssignedDate() {
        return taskAssignedDate;
    }

    public void setTaskAssignedDate(LocalDate taskAssignedDate, String emailId) {
        addNotification(emailId, "Task Assigned Date updated");
        this.taskAssignedDate = taskAssignedDate;
    }

    public LocalDate getTaskDeadlineDate() {
        return taskDeadlineDate;
    }

    public void setTaskDeadlineDate(LocalDate taskDeadlineDate, String emailId) {
        addNotification(emailId, "Task Deadline Date updated");
        this.taskDeadlineDate = taskDeadlineDate;
    }

    public LocalDateTime getLastCreated() {
        return lastCreated;
    }

    public void setLastCreated(LocalDateTime lastCreated, String emailId) {
        addNotification(emailId, "Last Created timestamp updated");
        this.lastCreated = lastCreated;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated, String emailId) {
        addNotification(emailId, "Last Updated timestamp updated");
        this.lastUpdated = lastUpdated;
    }

    public List<TaskNotification> getTaskNotifications() { return taskNotifications; }


    @Override
    public String toString() {
            return "Task{" +
                    "taskId=" + taskId +
                    ", taskTitle='" + taskTitle + '\'' +
                    ", taskDescription='" + taskDescription + '\'' +
                    ", taskPriority='" + taskPriority + '\'' +
                    ", taskStatus='" + taskStatus + '\'' +
                    ", taskProgress=" + taskProgress +
                    ", taskComments=" + taskComments +
                    ", assignedEmployees=" + assignedEmployees +
                    ", taskAssignedDate=" + taskAssignedDate +
                    ", taskDeadlineDate=" + taskDeadlineDate +
                    ", lastCreated=" + lastCreated +
                    ", lastUpdated=" + lastUpdated +
                    '}';
        }
    }





//package com.backend.kanban.Domain;
//
//import org.springframework.boot.autoconfigure.AutoConfiguration;
//import org.springframework.data.annotation.Id;
//import org.springframework.data.mongodb.core.mapping.Document;
//
//import java.util.Arrays;
//import java.util.List;
//
//@Document
//public class Task {
//    @Id
//    private int taskId;
//    private String taskTitle;
//    private String taskDescription;
//    private String taskPriority;
//    private String taskStatus;
//    private int taskProgress;
//    private List<String> taskComments;
//    private List<String> assignedEmployees;
//
//
//    public Task(int taskId, String taskTitle, String taskDescription, String taskPriority,String taskStatus,int taskProgress, List<String> taskComments,List<String> assignedEmployees) {
//        this.taskId = taskId;
//        this.taskTitle = taskTitle;
//        this.taskDescription = taskDescription;
//        this.taskPriority = taskPriority;
//        this.taskStatus = taskStatus;
//        this.taskProgress = taskProgress;
//        this.taskComments = taskComments;
//        this.assignedEmployees = assignedEmployees;
//    }
//
//    public Task() {
//    }
//
//
//
//    public int getTaskId() {
//        return taskId;
//    }
//
//    public void setTaskId(int taskId) {
//        this.taskId = taskId;
//    }
//
//    public String getTaskTitle() {
//        return taskTitle;
//    }
//
//    public void setTaskTitle(String taskTitle) {
//        this.taskTitle = taskTitle;
//    }
//
//    public String getTaskDescription() {
//        return taskDescription;
//    }
//
//    public void setTaskDescription(String taskDescription) {
//        this.taskDescription = taskDescription;
//    }
//
//    public String getTaskPriority() {
//        return taskPriority;
//    }
//
//    public void setTaskPriority(String taskPriority) {
//        this.taskPriority = taskPriority;
//    }
//
//    public String getTaskStatus() {
//        return taskStatus;
//    }
//
//    public void setTaskStatus(String taskStatus) {
//        this.taskStatus = taskStatus;
//    }
//
//    public int getTaskProgress() {
//        return taskProgress;
//    }
//
//    public void setTaskProgress(int taskProgress) {
//        this.taskProgress = taskProgress;
//    }
//
//    public List<String> getTaskComments() {
//        return taskComments;
//    }
//
//    public void setTaskComments(List<String>taskComments) {
//        this.taskComments = taskComments;
//    }
//
//    public List<String> getAssignedEmployees() {
//        return assignedEmployees;
//    }
//
//    public void setAssignedEmployees(List<String> assignedEmployees) {
//        this.assignedEmployees = assignedEmployees;
//    }
//
//
//
//    @Override
//    public String toString() {
//        return "Task{" +
//                "taskId=" + taskId +
//                ", taskTitle='" + taskTitle + '\'' +
//                ", taskDescription='" + taskDescription + '\'' +
//                ", taskPriority='" + taskPriority + '\'' +
//                ", taskStatus='" + taskStatus + '\'' +
//                ", taskProgress=" + taskProgress +
//                ", taskComments=" + taskComments +
//                ", assignedEmployees=" + assignedEmployees +
//                '}';
//    }
//}
