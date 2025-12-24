import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from './app-state.service';
import { TaskItem } from './api.service';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-page.component.html'
})
export class EmployeePageComponent implements OnInit {
  state = inject(AppStateService);
  statusChoice: Record<number, string> = {};
  priorityChoice: Record<number, string> = {};
  statusFilter: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'ALL';
  sortOption: 'DUE_ASC' | 'DUE_DESC' | 'PRIORITY' | 'STATUS' = 'DUE_ASC';

  private priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  private statusOrder: Record<string, number> = { PENDING: 0, IN_PROGRESS: 1, COMPLETED: 2 };

  // Track which task IDs we've already initialized choices for
  private initializedTasks = new Set<number>();

  constructor() {
    // Use effect to react to tasks signal changes
    effect(() => {
      const tasks = this.state.tasks();
      this.initChoicesForNewTasks(tasks);
    });
  }

  get tasks(): TaskItem[] { return this.state.tasks(); }

  // Derived view with filter + sort
  get viewTasks(): TaskItem[] {
    const filtered = this.statusFilter === 'ALL'
      ? this.tasks
      : this.tasks.filter(t => t.status === this.statusFilter);

    const sorted = [...filtered].sort((a, b) => {
      if (this.sortOption === 'PRIORITY') {
        return (this.priorityOrder[a.priority || 'MEDIUM'] ?? 99) - (this.priorityOrder[b.priority || 'MEDIUM'] ?? 99);
      }
      if (this.sortOption === 'STATUS') {
        return (this.statusOrder[a.status] ?? 99) - (this.statusOrder[b.status] ?? 99);
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return this.sortOption === 'DUE_DESC' ? bDue - aDue : aDue - bDue;
    });

    return sorted;
  }

  ngOnInit(): void {
    this.state.loadTasksForMe();
  }

  // Initialize choices only for tasks we haven't seen before
  private initChoicesForNewTasks(tasks: TaskItem[]) {
    tasks.forEach(t => {
      if (!t.id) return;
      // Only set initial values if we haven't done so already
      if (!this.initializedTasks.has(t.id)) {
        this.statusChoice[t.id] = t.status || 'PENDING';
        this.priorityChoice[t.id] = t.priority || 'MEDIUM';
        this.initializedTasks.add(t.id);
      }
    });
  }

  // Force refresh choices after save (to sync with new server values)
  refreshChoicesFromTasks() {
    this.initializedTasks.clear();
    this.initChoicesForNewTasks(this.tasks);
  }

  save(task: TaskItem) {
    const newStatus = this.statusChoice[task.id];
    const newPriority = this.priorityChoice[task.id];
    
    // Clear the initialized flag so next load picks up server values
    this.initializedTasks.delete(task.id);
    
    this.state.updateTask(task.id, newStatus, newPriority);
  }
}
