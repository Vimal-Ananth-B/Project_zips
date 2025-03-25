package com.backend.kanban.Exception;

public class TaskNotFoundException extends Exception{
    public TaskNotFoundException() {
        super("Task not found");
    }

    public TaskNotFoundException(String message) {
        super(message);
    }
}
