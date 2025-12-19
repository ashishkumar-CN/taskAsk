package com.example.taskask.dto;

public record UserPerformance(
        Long userId,
        String fullName,
        String email,
        long totalTasks,
        long completedTasks,
        double completionRatePercent
) {}
