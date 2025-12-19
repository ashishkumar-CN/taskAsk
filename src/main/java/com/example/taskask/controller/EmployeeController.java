package com.example.taskask.controller;

import com.example.taskask.dto.EmployeeResponse;
import com.example.taskask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EmployeeController {

    private final UserService userService;

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_ADMIN')")
    @GetMapping("/employees")
    public List<EmployeeResponse> listEmployees() {
        return userService.getEmployees();
    }
}
