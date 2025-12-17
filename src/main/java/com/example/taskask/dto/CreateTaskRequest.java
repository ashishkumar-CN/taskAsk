package com.example.taskask.dto;

import com.example.taskask.enums.TaskPriority;
import com.example.taskask.enums.TaskStatus;

import java.time.LocalDate;

public record CreateTaskRequest(
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate startDate,
        LocalDate dueDate,
        Long createdByUserId, // manager id
        Long assignedToUserId // employee id
) {}
