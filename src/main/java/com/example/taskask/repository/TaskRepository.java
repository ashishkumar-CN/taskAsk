package com.example.taskask.repository;

import com.example.taskask.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByAssignedToId(Long userId);
    List<Task> findAllByCreatedById(Long managerId);
}
