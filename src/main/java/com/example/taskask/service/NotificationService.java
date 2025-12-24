package com.example.taskask.service;

import com.example.taskask.dto.NotificationResponse;
import com.example.taskask.entity.Notification;
import com.example.taskask.entity.Task;
import com.example.taskask.entity.User;
import com.example.taskask.enums.NotificationType;
import com.example.taskask.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for notification operations.
 * 
 * Architecture:
 * Controller → Service → Repository → Database
 * 
 * The service layer handles:
 * - Business logic (creating notifications with proper messages)
 * - Transaction management (@Transactional)
 * - Converting entities to DTOs
 */
@Service
@RequiredArgsConstructor  // Lombok: generates constructor for final fields (dependency injection)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Get all notifications for a user, newest first.
     * 
     * @param userId The user's ID
     * @return List of NotificationResponse DTOs
     */
    public List<NotificationResponse> getNotificationsForUser(Long userId) {
        // Fetch from database
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Convert entities to DTOs using Stream API
        // .stream() - creates a stream from the list
        // .map() - transforms each element
        // .toList() - collects back to a list
        return notifications.stream()
                .map(this::toResponse)  // Method reference: same as n -> toResponse(n)
                .toList();
    }

    /**
     * Get count of unread notifications for a user.
     * Used to display the badge number on the notification icon.
     * 
     * @param userId The user's ID
     * @return Number of unread notifications
     */
    public long getUnreadCount(Long userId) {
        // Count where isRead = false
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    /**
     * Mark all notifications as read for a user.
     * Called when user clicks "Mark all as read".
     * 
     * @Transactional is required for @Modifying queries in Spring Data JPA.
     * It ensures the operation is atomic (all-or-nothing).
     * 
     * @param userId The user's ID
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }

    /**
     * Create a notification when a task is assigned to someone.
     * 
     * Called from TaskService when a new task is created.
     * 
     * @param task The task that was assigned
     * @param assignee The user who was assigned the task
     * @param assigner The user who assigned the task (manager/team lead)
     */
    @Transactional
    public void notifyTaskAssigned(Task task, User assignee, User assigner) {
        // Build a human-readable message
        String message = String.format(
                "%s assigned you a task: %s",
                assigner.getFullName(),
                task.getTitle()
        );

        // Create and save the notification
        Notification notification = Notification.builder()
                .user(assignee)           // Who receives it
                .message(message)         // What it says
                .type(NotificationType.TASK_ASSIGNED)
                .task(task)               // Link to the task
                .isRead(false)            // Unread by default
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Create a notification when a task is completed.
     * 
     * Called from TaskService when task status changes to COMPLETED.
     * Notifies the person who created/assigned the task.
     * 
     * @param task The task that was completed
     * @param completedBy The user who completed the task
     */
    @Transactional
    public void notifyTaskCompleted(Task task, User completedBy) {
        // Get the user who created the task (manager/team lead)
        User creator = task.getCreatedBy();
        
        // Don't notify if the creator completed their own task
        if (creator.getId().equals(completedBy.getId())) {
            return;
        }

        // Build a human-readable message
        String message = String.format(
                "%s completed the task: %s",
                completedBy.getFullName(),
                task.getTitle()
        );

        // Create and save the notification
        Notification notification = Notification.builder()
                .user(creator)            // Notify the task creator
                .message(message)
                .type(NotificationType.TASK_COMPLETED)
                .task(task)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    /**
     * Helper method to convert Entity to DTO.
     * 
     * Private because it's only used internally.
     * 
     * @param notification The entity from database
     * @return NotificationResponse DTO for frontend
     */
    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getType(),
                notification.getIsRead(),
                notification.getTask() != null ? notification.getTask().getId() : null,
                notification.getCreatedAt()
        );
    }
}
