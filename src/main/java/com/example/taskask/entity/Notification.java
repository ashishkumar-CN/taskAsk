package com.example.taskask.entity;

import com.example.taskask.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Entity representing a notification in the system.
 * 
 * Notifications are created automatically when:
 * 1. A task is ASSIGNED to a user → recipient = assignee
 * 2. A task is COMPLETED → recipient = the person who created/assigned the task
 * 
 * The `isRead` field tracks whether the user has seen this notification.
 * Users can mark all notifications as read, which sets isRead=true for all their notifications.
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who will receive this notification.
     * This is a many-to-one relationship: one user can have many notifications.
     */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The notification message displayed to the user.
     * Example: "John Doe assigned you a task: Fix login bug"
     */
    @Column(nullable = false, length = 500)
    private String message;

    /**
     * The type of notification - helps with filtering and displaying icons.
     * @see NotificationType
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    /**
     * Whether the user has read/seen this notification.
     * Defaults to false (unread) when created.
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    /**
     * Optional reference to the related task.
     * Useful for "click to view task" functionality in the future.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    /**
     * Timestamp when the notification was created.
     * Automatically set by Hibernate on insert.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
