package com.backend.kanban.Domain;

import java.time.LocalDateTime;

public class TaskNotification {
        private String emailId;
        private String changeDescription;
        private LocalDateTime timestamp;

        public TaskNotification(String emailId,String changeDescription,LocalDateTime timestamp){
            this.emailId=emailId;
            this.changeDescription=changeDescription;
            this.timestamp=timestamp;
        }

        public String getEmailId(){
            return emailId;
        }

        public String getChangeDescription(){
            return changeDescription;
        }

        public LocalDateTime getTimestamp(){
            return timestamp;
        }
    }

