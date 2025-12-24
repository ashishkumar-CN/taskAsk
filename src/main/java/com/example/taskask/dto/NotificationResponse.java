package com.example.taskask.dto;

import com.example.taskask.enums.NotificationType;

import java.time.Instant;

/**
 * DTO for sending notification data to the frontend.
 * 
 * Why use a DTO instead of the Entity directly?
 * 1. Avoids circular references (User → Notifications → User...)
 * 2. Only sends necessary fields (no lazy-loading issues)
 * 3. Can format/transform data as needed
 * 4. Decouples API contract from database schema
 * 
 * Java Records (introduced in Java 14) are perfect for DTOs:
 * - Immutable by default
 * - Auto-generates constructor, getters, equals, hashCode, toString
 * - Concise syntax
 */
public record NotificationResponse(
        Long id,                    // Notification ID
        String message,             // The notification text
        NotificationType type,      // TASK_ASSIGNED or TASK_COMPLETED
        Boolean isRead,             // Has user seen it?
        Long taskId,                // Related task ID (nullable)
        Instant createdAt           // When it was created
) {}
