package com.example.taskask.dto;

import java.util.List;

public record PerformanceSummary(
        long totalTasks,
        long completedTasks,
        long inProgressTasks,
        long pendingTasks,
        double completionRatePercent,
        List<UserPerformance> userStats
) {}
