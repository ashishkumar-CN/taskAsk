package com.example.taskask.dto;

import com.example.taskask.entity.Task;
import com.example.taskask.enums.TaskPriority;
import com.example.taskask.enums.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate startDate,
        LocalDate dueDate,
        Long createdByUserId,
        Long assignedToUserId,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse fromEntity(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getStartDate(),
                task.getDueDate(),
                task.getCreatedBy().getId(),
                task.getAssignedTo().getId(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
