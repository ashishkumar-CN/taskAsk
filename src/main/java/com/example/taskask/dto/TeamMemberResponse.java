package com.example.taskask.dto;

public record TeamMemberResponse(
        Long userId,
        String fullName,
        String email
) {}
