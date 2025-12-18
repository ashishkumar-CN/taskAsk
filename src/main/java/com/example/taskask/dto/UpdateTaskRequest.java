package com.example.taskask.dto;

import com.example.taskask.enums.TaskPriority;
import com.example.taskask.enums.TaskStatus;

public record UpdateTaskRequest(TaskStatus status, TaskPriority priority) {}
