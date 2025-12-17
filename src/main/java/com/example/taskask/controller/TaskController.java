package com.example.taskask.controller;

import com.example.taskask.dto.CreateTaskRequest;
import com.example.taskask.dto.CreateUserRequest;
import com.example.taskask.dto.TaskResponse;
import com.example.taskask.dto.UpdateTaskStatusRequest;
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

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/tasks")
    public TaskResponse createTask(@RequestBody CreateTaskRequest request) {
        return taskService.createTask(request);
    }

    @PreAuthorize("hasAnyRole('MANAGER','EMPLOYEE')")
    @GetMapping("/tasks/assigned/{userId}")
    public List<TaskResponse> getTasksForUser(@PathVariable Long userId) {
        return taskService.getTasksForAssignee(userId);
    }

    @PreAuthorize("hasAnyRole('MANAGER','EMPLOYEE')")
    @PatchMapping("/tasks/{taskId}/status")
    public TaskResponse updateStatus(@PathVariable Long taskId,
                                     @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateStatus(taskId, request);
    }
}
