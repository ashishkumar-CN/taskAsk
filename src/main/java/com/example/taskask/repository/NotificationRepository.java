package com.example.taskask.repository;

import com.example.taskask.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Repository for Notification entity.
 * 
 * Spring Data JPA automatically implements these methods based on method names:
 * - findBy... → SELECT WHERE ...
 * - countBy... → SELECT COUNT(*) WHERE ...
 * - OrderBy...Desc → ORDER BY ... DESC
 * 
 * For complex operations (like UPDATE), we use @Query with JPQL.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a specific user, ordered by newest first.
     * 
     * Method name breakdown:
     * - findBy → SELECT FROM notifications WHERE
     * - User_Id → user_id = ?
     * - OrderByCreatedAtDesc → ORDER BY created_at DESC
     * 
     * @param userId The ID of the user
     * @return List of notifications, newest first
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Count unread notifications for a user.
     * 
     * Method name breakdown:
     * - countBy → SELECT COUNT(*) WHERE
     * - UserId → user_id = ?
     * - And → AND
     * - IsRead → is_read = ?
     * 
     * @param userId The user's ID
     * @param isRead false to count unread, true to count read
     * @return Number of notifications matching criteria
     */
    long countByUserIdAndIsRead(Long userId, Boolean isRead);

    /**
     * Mark all notifications as read for a specific user.
     * 
     * This uses a custom JPQL query because Spring Data JPA 
     * doesn't auto-generate UPDATE queries from method names.
     * 
     * @Modifying - Tells Spring this modifies data (not just reads)
     * @Query - Custom JPQL (Java Persistence Query Language)
     * 
     * @param userId The user whose notifications to mark as read
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") Long userId);
}
