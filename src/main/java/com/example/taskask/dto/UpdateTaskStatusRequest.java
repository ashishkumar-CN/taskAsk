package com.example.taskask.dto;

import com.example.taskask.enums.TaskStatus;

public record UpdateTaskStatusRequest(TaskStatus status) {}
