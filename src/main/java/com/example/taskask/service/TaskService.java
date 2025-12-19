package com.example.taskask.service;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.taskask.dto.CreateTaskRequest;
import com.example.taskask.dto.PerformanceSummary;
import com.example.taskask.dto.TaskResponse;
import com.example.taskask.dto.UpdateTaskRequest;
import com.example.taskask.dto.UserPerformance;
import com.example.taskask.entity.Task;
import com.example.taskask.entity.User;
import com.example.taskask.enums.Role;
import com.example.taskask.enums.TaskStatus;
import com.example.taskask.repository.TaskRepository;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {
    

    private final TaskRepository taskRepository;
    private final UserService userService;

    public TaskResponse createTask(CreateTaskRequest request) {

        User manager = userService.getUserOrThrow(request.createdByUserId());
        if(manager.getRole() != Role.MANAGER && manager.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(BAD_REQUEST, "createdBy must be a MANAGER or ADMIN");
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

     public List<TaskResponse> getTasksCreatedBy(Long managerId) {
        return taskRepository.findAllByCreatedById(managerId).stream()
                .map(TaskResponse::fromEntity)
                .toList();
     }

     @Transactional(readOnly = true)
     public List<TaskResponse> getAllTasks() {
         return taskRepository.findAll().stream()
                 .map(TaskResponse::fromEntity)
                 .toList();
     }

     @Transactional(readOnly = true)
     public PerformanceSummary getPerformanceSummary() {
         List<Task> tasks = taskRepository.findAll();

         long total = tasks.size();
         long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
         long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
         long pending = tasks.stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();

         double completionRate = total == 0 ? 0.0 : (completed * 100.0) / total;

         Map<Long, PerfCounter> counters = new HashMap<>();
         tasks.forEach(task -> {
             User assignee = task.getAssignedTo();
             if (assignee == null || assignee.getId() == null) {
                 return;
             }
             PerfCounter counter = counters.computeIfAbsent(
                     assignee.getId(),
                     id -> new PerfCounter(id, assignee.getFullName(), assignee.getEmail())
             );
             counter.totalTasks++;
             if (task.getStatus() == TaskStatus.COMPLETED) {
                 counter.completedTasks++;
             }
         });

         List<UserPerformance> userStats = counters.values().stream()
                 .map(c -> new UserPerformance(
                         c.userId,
                         c.fullName,
                         c.email,
                         c.totalTasks,
                         c.completedTasks,
                         c.totalTasks == 0 ? 0.0 : (c.completedTasks * 100.0) / c.totalTasks
                 ))
                 .sorted(Comparator.comparing(UserPerformance::completionRatePercent).reversed())
                 .toList();

         return new PerformanceSummary(
                 total,
                 completed,
                 inProgress,
                 pending,
                 completionRate,
                 userStats
         );
     }

     public TaskResponse updateTask(Long taskId, UpdateTaskRequest req) {
        Task task = taskRepository.findById(taskId).orElseThrow(( ) -> new ResponseStatusException(BAD_REQUEST, "Task Not Found " + taskId));

        if (req.status() != null) {
            task.setStatus(req.status());
        }
        if (req.priority() != null) {
            task.setPriority(req.priority());
        }

        return TaskResponse.fromEntity(taskRepository.save(task));
     }

      public void deleteTask(Long taskId) {
          if (!taskRepository.existsById(taskId)) {
                throw new ResponseStatusException(BAD_REQUEST, "Task Not Found " + taskId);
          }
          taskRepository.deleteById(taskId);
      }

     private static class PerfCounter {
         private final Long userId;
         private final String fullName;
         private final String email;
         private long totalTasks = 0;
         private long completedTasks = 0;

         PerfCounter(Long userId, String fullName, String email) {
             this.userId = userId;
             this.fullName = fullName;
             this.email = email;
         }
     }
}
