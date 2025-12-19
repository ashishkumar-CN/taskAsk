package com.example.taskask.repository;

import com.example.taskask.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByAssignedToId(Long userId);
    List<Task> findAllByCreatedById(Long managerId);

    Page<Task> findAllByAssignedToId(Long userId, Pageable pageable);
}
