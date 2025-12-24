package com.example.taskask.enums;

/**
 * Enum representing the different types of notifications in the system.
 * 
 * TASK_ASSIGNED - Sent when a task is assigned to a user
 * TASK_COMPLETED - Sent when an assigned task is marked as completed
 */
public enum NotificationType {
    TASK_ASSIGNED,    // When someone assigns a task to you
    TASK_COMPLETED    // When a task you assigned is completed by the assignee
}
