package com.example.taskask.controller;

import com.example.taskask.dto.CreateTaskRequest;
import com.example.taskask.dto.CreateUserRequest;
import com.example.taskask.dto.TaskResponse;
import com.example.taskask.dto.UpdateTaskRequest;
import com.example.taskask.entity.User;
import com.example.taskask.service.TaskService;
import com.example.taskask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TaskController {

    private final UserService userService;
    private final TaskService taskService;

    @PostMapping("/users")
    public User createUser(@RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','MANAGER')")
    @PostMapping("/tasks")
    public TaskResponse createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_EMPLOYEE','MANAGER','EMPLOYEE')")
    @GetMapping("/tasks/assigned/{userId}")
    public List<TaskResponse> getTasksForUser(@PathVariable Long userId) {
        return taskService.getTasksForAssignee(userId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','MANAGER')")
    @GetMapping("/tasks/created/{managerId}")
    public List<TaskResponse> getTasksCreatedBy(@PathVariable Long managerId) {
        return taskService.getTasksCreatedBy(managerId);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','ROLE_EMPLOYEE','MANAGER','EMPLOYEE')")
    @PatchMapping("/tasks/{taskId}/status")
    public TaskResponse updateStatus(@PathVariable Long taskId,
                                     @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(taskId, request);
    }

    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER','MANAGER')")
    @DeleteMapping("/tasks/{taskId}")
    public void deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
    }
}
