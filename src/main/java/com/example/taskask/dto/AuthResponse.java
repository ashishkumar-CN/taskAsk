package com.example.taskask.dto;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String role
) {}
