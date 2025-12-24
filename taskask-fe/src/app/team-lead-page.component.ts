import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from './app-state.service';
import { ApiService, TaskItem } from './api.service';

@Component({
  selector: 'app-team-lead-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-lead-page.component.html'
})
export class TeamLeadPageComponent implements OnInit {
  state = inject(AppStateService);
  private api = inject(ApiService);

  teamName = '';
  addUserId = '';
  taskTitle = '';
  taskDescription = '';
  taskPriority = 'MEDIUM';
  taskDueDate = '';
  taskAssigneeId = '';
  localError = '';
  localMessage = '';

  get employees() { return this.state.employees(); }
  get teamMembers() { return this.state.teamMembers(); }
  get tasks(): TaskItem[] {
    const created = this.state.managerTasks();
    return created.length ? created : this.state.tasks();
  }

  ngOnInit(): void {
    this.state.loadEmployees();
    this.state.loadManagerTasks();
    this.state.loadMyTeam();
    this.state.loadMyTeamMembers();
  }

  saveTeam() {
    if (!this.teamName.trim()) {
      this.localError = 'Team name is required';
      return;
    }
    this.localError = '';
    this.state.createTeam(this.teamName.trim());
    this.localMessage = 'Team saved';
  }

  addMember() {
    const userId = Number(this.addUserId);
    if (!userId) {
      this.localError = 'Pick a user to add';
      return;
    }
    this.localError = '';
    this.state.addTeamMember(userId);
    this.localMessage = 'Member added';
    this.addUserId = '';
  }

  createTask() {
    this.localError = '';
    this.localMessage = '';
    
    const title = this.taskTitle.trim();
    const assigneeId = Number(this.taskAssigneeId);
    const creatorId = this.state.userId();
    const token = this.state.token();
    
    if (!title || !assigneeId || !creatorId) {
      this.localError = 'Title and assignee are required';
      return;
    }
    
    // Enforce assignee is in team on the client side too
    const allowed = this.teamMembers.some(m => m.userId === assigneeId);
    if (!allowed) {
      this.localError = 'Pick someone from your team';
      return;
    }
    
    // Call API directly to properly handle success/error
    this.api.createTask({
      title,
      description: this.taskDescription.trim() || null,
      priority: this.taskPriority,
      status: 'PENDING',
      startDate: null,
      dueDate: this.taskDueDate || null,
      createdByUserId: creatorId,
      assignedToUserId: assigneeId
    }, token).subscribe({
      next: () => {
        // Only show success AFTER the API confirms
        this.localMessage = 'Task created successfully!';
        this.localError = '';
        // Reset form
        this.taskTitle = '';
        this.taskDescription = '';
        this.taskPriority = 'MEDIUM';
        this.taskDueDate = '';
        this.taskAssigneeId = '';
        // Refresh task lists
        this.state.loadManagerTasks();
        this.state.loadTasksForMe();
        this.state.refreshNotifications();
      },
      error: (err) => {
        // Show the actual error from the backend
        this.localError = err?.error?.message || err?.message || 'Failed to create task';
        this.localMessage = '';
      }
    });
  }
}
