package com.example.taskask.dto;

import com.example.taskask.enums.Role;

public record UserSummary(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean active
) {}
