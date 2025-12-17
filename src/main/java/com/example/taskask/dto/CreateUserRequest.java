package com.example.taskask.dto;

import com.example.taskask.enums.Role;

public record CreateUserRequest(
        String fullName,
        String email,
        String password,
        Role role
) {}
