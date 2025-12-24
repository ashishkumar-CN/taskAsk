package com.example.taskask.controller;

import com.example.taskask.dto.PerformanceSummary;
import com.example.taskask.dto.TaskResponse;
import com.example.taskask.dto.TeamResponse;
import com.example.taskask.dto.UserSummary;
import com.example.taskask.service.TaskService;
import com.example.taskask.service.TeamService;
import com.example.taskask.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final TaskService taskService;
    private final UserService userService;
    private final TeamService teamService;

    @GetMapping("/tasks")
    public List<TaskResponse> listAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/users")
    public List<UserSummary> listAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/performance")
    public PerformanceSummary performanceSummary() {
        return taskService.getPerformanceSummary();
    }

    @GetMapping("/teams")
    public List<TeamResponse> listAllTeams() {
        return teamService.getAllTeams();
    }
}
