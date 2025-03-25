package com.backend.kanban.Proxy;

import com.backend.kanban.Domain.Employee;
import com.backend.kanban.Domain.PasswordUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name="userservice",url="http://localhost:8082")
public interface EmployeeProxy {
    @PostMapping("/api/v1/register")
    public ResponseEntity<?> saveEmployee(@RequestBody Employee employee);

//    @PutMapping("/api/v1/resetPassword")
//    public ResponseEntity<?> updatePassword(@RequestBody PasswordUpdateRequest request);

    @PutMapping(value = "/api/v1/resetPassword",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<Map<String, String>> updatePassword(@RequestBody PasswordUpdateRequest request);

}