package com.example.taskask.controller;

import com.example.taskask.dto.NotificationResponse;
import com.example.taskask.service.NotificationService;
import com.example.taskask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for notification endpoints.
 * 
 * Base URL: /api/notifications
 * 
 * Endpoints:
 * - GET  /api/notifications        → Get all notifications for logged-in user
 * - GET  /api/notifications/unread-count → Get count of unread notifications
 * - POST /api/notifications/mark-read    → Mark all as read
 * 
 * All endpoints require authentication (any logged-in user with any role).
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    /**
     * Get all notifications for the currently logged-in user.
     * 
     * @PreAuthorize ensures only authenticated users can access this.
     * The Principal object contains info about the logged-in user.
     * 
     * @param principal Injected by Spring Security, contains user info
     * @return List of notifications, newest first
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_EMPLOYEE','ROLE_TEAM_LEAD')")
    @GetMapping
    public List<NotificationResponse> getMyNotifications(Principal principal) {
        // Get user ID from the authenticated principal (email)
        Long userId = getUserId(principal);
        return notificationService.getNotificationsForUser(userId);
    }

    /**
     * Get the count of unread notifications.
     * 
     * Used by the frontend to display a badge like "🔔 (3)"
     * 
     * Returns a Map for JSON like: { "count": 5 }
     * 
     * @param principal The logged-in user
     * @return Map with "count" key
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_EMPLOYEE','ROLE_TEAM_LEAD')")
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Principal principal) {
        Long userId = getUserId(principal);
        long count = notificationService.getUnreadCount(userId);
        
        // Return as JSON object: { "count": 5 }
        return Map.of("count", count);
    }

    /**
     * Mark all notifications as read for the current user.
     * 
     * Called when user clicks "Mark all as read" button.
     * 
     * @param principal The logged-in user
     */
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_MANAGER','ROLE_EMPLOYEE','ROLE_TEAM_LEAD')")
    @PostMapping("/mark-read")
    public void markAllAsRead(Principal principal) {
        Long userId = getUserId(principal);
        notificationService.markAllAsRead(userId);
    }

    /**
     * Helper: Get user ID from Principal.
     * 
     * Principal.getName() returns the username, which in our case is the email.
     * We use UserService to look up the user by email and get their ID.
     * 
     * @param principal Spring Security principal
     * @return The user's database ID
     */
    private Long getUserId(Principal principal) {
        String email = principal.getName();
        return userService.getByEmailOrThrow(email).getId();
    }
}
