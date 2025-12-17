package com.example.taskask.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.taskask.dto.CreateTaskRequest;
import com.example.taskask.dto.TaskResponse;
import com.example.taskask.dto.UpdateTaskStatusRequest;
import com.example.taskask.entity.Task;
import com.example.taskask.entity.User;
import com.example.taskask.enums.Role;
import com.example.taskask.repository.TaskRepository;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskResponse createTask(CreateTaskRequest request) {

        User manager = userService.getUserOrThrow(request.createdByUserId());
        if(manager.getRole() != Role.MANAGER) {
            throw new ResponseStatusException(BAD_REQUEST, "CREATEDby SHOULD BE A MANAGER");
        }
    

        User assignee = userService.getUserOrThrow(request.assignedToUserId());
        if (assignee.getRole() != Role.EMPLOYEE) {
            throw new ResponseStatusException(BAD_REQUEST, "assignedTo must be an EMPLOYEE");
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority() == null ? com.example.taskask.enums.TaskPriority.MEDIUM : request.priority())
                .status(request.status() == null ? com.example.taskask.enums.TaskStatus.PENDING : request.status())
                .startDate(request.startDate())
                .dueDate(request.dueDate())
                .createdBy(manager)
                .assignedTo(assignee)
                .build();

        return TaskResponse.fromEntity(taskRepository.save(task));

     }       

     public List <TaskResponse> getTasksForAssignee (Long userId) {
        return taskRepository.findAllByAssignedToId(userId).stream().map(TaskResponse::fromEntity).toList();
     }

     public TaskResponse updateStatus(Long taskId, UpdateTaskStatusRequest req) {
        Task task = taskRepository.findById(taskId).orElseThrow(( ) -> new ResponseStatusException(BAD_REQUEST, "Task Not Found " + taskId));
        
        task.setStatus(req.status());

        return TaskResponse.fromEntity(taskRepository.save(task));
     }
}
