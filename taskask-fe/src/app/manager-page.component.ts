import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from './app-state.service';
import { TaskItem } from './api.service';

@Component({
  selector: 'app-manager-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-page.component.html'
})
export class ManagerPageComponent implements OnInit {
  state = inject(AppStateService);

  taskTitle = '';
  taskDescription = '';
  taskPriority = 'MEDIUM';
  taskDueDate = '';
  taskAssigneeId = '';
  localError = '';
  localMessage = '';

  get employees() { return this.state.employees(); }
  get tasks(): TaskItem[] {
    // show created tasks; fallback to assigned
    const created = this.state.managerTasks();
    return created.length ? created : this.state.tasks();
  }

  ngOnInit(): void {
    this.state.loadEmployees();
    this.state.loadManagerTasks();
  }

  createTask() {
    this.localError = '';
    this.localMessage = '';
    const title = this.taskTitle.trim();
    const assigneeId = Number(this.taskAssigneeId);
    const creatorId = this.state.userId();
    if (!title) {
      this.localError = 'Title is required';
      return;
    }
    if (!assigneeId) {
      this.localError = 'Pick an assignee';
      return;
    }
    if (!creatorId) return;
    this.state.createTask({
      title,
      description: this.taskDescription.trim() || null,
      priority: this.taskPriority,
      status: 'PENDING',
      startDate: null,
      dueDate: this.taskDueDate || null,
      createdByUserId: creatorId,
      assignedToUserId: assigneeId
    });
    this.localMessage = 'Task submitted';
    this.taskTitle = '';
    this.taskDescription = '';
    this.taskPriority = 'MEDIUM';
    this.taskDueDate = '';
    this.taskAssigneeId = '';
  }
}
