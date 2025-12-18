package com.example.taskask.dto;

public record EmployeeResponse(
        Long id,
        String fullName,
        String email
) {}
