// Core Angular imports
import { Component, computed, signal, OnInit } from '@angular/core';

// Routing outlet (used when routing is added)
import { RouterOutlet } from '@angular/router';

// Common Angular directives
import { NgFor, NgClass, NgIf } from '@angular/common';

// Needed for [(ngModel)] two-way binding
import { FormsModule } from '@angular/forms';

// Service that talks to Spring Boot backend
import { ApiService, CreateTaskRequest, EmployeeOption, TaskItem } from './api.service';

@Component({
  selector: 'app-root', // <app-root> is the entry component
  imports: [RouterOutlet, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './app.html', // HTML view
  styleUrl: './app.css'      // CSS styles
})
export class App implements OnInit {

  /* =========================
     BASIC APP INFO (signals)
     ========================= */

  // Reactive title - UI updates automatically if it changes
  readonly title = signal('TaskAsk');

  // Subtitle shown on the page
  readonly tagline = signal('Employee Task & Performance Management System');


  /* =========================
     AUTHENTICATION STATE
     ========================= */

  // Controls whether login or signup form is shown
  readonly authMode = signal<'login' | 'signup'>('login');

  // Error message shown in UI
  readonly authError = signal('');

  // Success/info message shown in UI
  readonly authMessage = signal('');

  // Used to disable buttons / show loading
  readonly isLoading = signal(false);


  /* =========================
     USER SESSION DATA
     ========================= */

  // JWT token returned from backend
  readonly token = signal('');

  // Logged-in user's ID
  readonly userId = signal<number | null>(null);

  // Logged-in user's email
  readonly userEmail = signal('');

  // Logged-in user's role (MANAGER / EMPLOYEE)
  readonly userRole = signal('');

  // Computed signal: true if token exists
  readonly isLoggedIn = computed(() => !!this.token());


  /* =========================
     FORM INPUT VARIABLES
     (used with ngModel)
     ========================= */

  // Login form
  loginEmail = '';
  loginPassword = '';

  // Signup form
  signupFullName = '';
  signupEmail = '';
  signupPassword = '';
  signupRole: 'MANAGER' | 'EMPLOYEE' = 'EMPLOYEE';

  // Create task form (manager)
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskPriority = 'MEDIUM';
  newTaskStartDate = '';
  newTaskDueDate = '';
  newTaskAssigneeId = '';


  /* =========================
     TASK DATA
     ========================= */

  // List of tasks fetched from backend
  readonly tasks = signal<TaskItem[]>([]);

  // Selected filter (ALL / PENDING / IN_PROGRESS / COMPLETED)
  readonly statusFilter = signal('ALL');

  // Task success/error messages
  readonly taskError = signal('');
  readonly taskMessage = signal('');

  // Employee list for assignment (manager only)
  readonly employees = signal<EmployeeOption[]>([]);

  // Tasks created by the manager
  readonly managerTasks = signal<TaskItem[]>([]);

  // Selection maps for editable fields
  statusChoice: Record<number, string> = {};
  priorityChoice: Record<number, string> = {};

  readonly statusFilters = [
    { value: 'ALL', label: 'All' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  readonly statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
  readonly priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];

  private readonly statusOrder: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 1,
    COMPLETED: 2
  };

  private readonly priorityOrder: Record<string, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2
  };

  // Derived list based on selected filter
  readonly filteredTasks = computed(() => {
    const filter = this.statusFilter();

    // Managers see both tasks assigned to them and tasks they created; employees see assigned tasks only
    const combined = this.userRole() === 'MANAGER'
      ? (() => {
          const map = new Map<number, TaskItem>();
          this.tasks().forEach(t => t?.id && map.set(t.id, t));
          this.managerTasks().forEach(t => t?.id && map.set(t.id, t));
          return this.sortTasks(Array.from(map.values()));
        })()
      : this.sortTasks(this.tasks());

    if (filter === 'ALL') return combined;
    return combined.filter(task => task.status === filter);
  });

  // Set the current filter value (used by filter buttons)
  setFilter(filter: string) {
    this.statusFilter.set(filter);
  }

  // Helper to show assignee label in manager view
  getEmployeeLabel(id: number | undefined | null) {
    if (!id) return 'Unknown';
    const emp = this.employees().find(e => e.id === id);
    return emp ? `${emp.fullName} (${emp.email})` : `User #${id}`;
  }


  /* =========================
     CONSTRUCTOR
     ========================= */

  // ApiService is injected by Angular (Dependency Injection)
  constructor(private api: ApiService) {}


  /* =========================
     APP INITIALIZATION
     ========================= */

  // Runs once when app loads
  ngOnInit(): void {
    // Prevent issues during server-side rendering
    if (typeof window === 'undefined') return;

    // Restore login info from browser storage
    const token = localStorage.getItem('taskask_token');
    const userId = localStorage.getItem('taskask_userId');
    const email = localStorage.getItem('taskask_email');
    const role = localStorage.getItem('taskask_role');

    // If user was already logged in
    if (token && userId) {
      this.token.set(token);
      this.userId.set(Number(userId));
      if (email) this.userEmail.set(email);
      if (role) this.userRole.set(role);

      // Load tasks automatically
      this.loadTasks();

      // Load employees for managers
      if (role === 'MANAGER') {
        this.loadEmployees();
        this.loadManagerTasks();
      }
    }
  }


  /* =========================
     AUTH MODE SWITCH
     ========================= */

  setAuthMode(mode: 'login' | 'signup') {
    this.authMode.set(mode);
    this.authError.set('');
    this.authMessage.set('');
  }


  /* =========================
     SIGNUP LOGIC
     ========================= */

  signup() {
    this.authError.set('');
    this.authMessage.set('');

    // Simple validation
    if (!this.signupFullName || !this.signupEmail || !this.signupPassword) {
      this.authError.set('Full name, email, and password are required.');
      return;
    }

    this.isLoading.set(true);

    // Call backend to create user
    this.api.createUser({
      fullName: this.signupFullName.trim(),
      email: this.signupEmail.trim(),
      password: this.signupPassword,
      role: this.signupRole
    }).subscribe({
      next: () => {
        this.authMessage.set('Account created. You can log in now.');
        this.setAuthMode('login');

        // Auto-fill login email
        this.loginEmail = this.signupEmail.trim();
        this.signupPassword = '';
        this.isLoading.set(false);
      },
      error: () => {
        this.authError.set('Signup failed. Try a different email.');
        this.isLoading.set(false);
      }
    });
  }


  /* =========================
     LOGIN LOGIC
     ========================= */

  login() {
    this.authError.set('');
    this.authMessage.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.authError.set('Email and password are required.');
      return;
    }

    this.isLoading.set(true);

    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: response => {
        // Save login data
        this.token.set(response.token);
        this.userId.set(response.userId);
        this.userEmail.set(response.email);
        this.userRole.set(response.role);

        // Persist login across refresh
        localStorage.setItem('taskask_token', response.token);
        localStorage.setItem('taskask_userId', String(response.userId));
        localStorage.setItem('taskask_email', response.email);
        localStorage.setItem('taskask_role', response.role);

        this.loginPassword = '';
        this.loadTasks();
        if (response.role === 'MANAGER') {
          this.loadEmployees();
          this.loadManagerTasks();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.authError.set('Login failed. Check your email and password.');
        this.isLoading.set(false);
      }
    });
  }


  /* =========================
     LOGOUT
     ========================= */

  logout() {
    this.token.set('');
    this.userId.set(null);
    this.userEmail.set('');
    this.userRole.set('');
    this.tasks.set([]);
    this.managerTasks.set([]);
    this.employees.set([]);
    this.authError.set('');
    this.authMessage.set('');
    this.taskError.set('');
    this.taskMessage.set('');

    localStorage.removeItem('taskask_token');
    localStorage.removeItem('taskask_userId');
    localStorage.removeItem('taskask_email');
    localStorage.removeItem('taskask_role');
  }


  /* =========================
     TASK OPERATIONS
     ========================= */

  loadTasks() {
    const id = this.userId();
    const token = this.token();

    if (!id || !token) return;

    this.api.getTasksForUser(id, token).subscribe({
      next: tasks => {
        this.tasks.set(tasks);
        this.setTaskChoices(tasks);
        this.taskError.set('');
      },
      error: () => {
        this.taskError.set('Failed to load tasks.');
      }
    });
  }

  loadEmployees() {
    const token = this.token();
    if (!token) return;

    this.api.getEmployees(token).subscribe({
      next: employees => {
        this.employees.set(employees);
      },
      error: () => {
        this.taskError.set('Failed to load employees.');
      }
    });
  }

  loadManagerTasks() {
    const id = this.userId();
    const token = this.token();
    if (!id || !token) return;

    this.api.getTasksCreatedBy(id, token).subscribe({
      next: tasks => {
        this.managerTasks.set(tasks);
        this.setTaskChoices(tasks);
      },
      error: () => {
        this.taskError.set('Failed to load tasks you created.');
      }
    });
  }

  createTask() {
    this.taskError.set('');
    this.taskMessage.set('');

    const title = this.newTaskTitle.trim();
    const assigneeId = Number(this.newTaskAssigneeId);
    const createdBy = this.userId();
    const token = this.token();

    if (!title) {
      this.taskError.set('Task title is required.');
      return;
    }

    if (!assigneeId) {
      this.taskError.set('Please select an employee.');
      return;
    }

    if (!createdBy || !token) {
      this.taskError.set('You must be logged in to create a task.');
      return;
    }

    const payload: CreateTaskRequest = {
      title,
      description: this.newTaskDescription.trim() || null,
      priority: this.newTaskPriority,
      status: 'PENDING',
      startDate: this.newTaskStartDate || null,
      dueDate: this.newTaskDueDate || null,
      createdByUserId: createdBy,
      assignedToUserId: assigneeId
    };

    this.isLoading.set(true);
    this.api.createTask(payload, token).subscribe({
      next: () => {
        this.taskMessage.set('Task created.');
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.newTaskPriority = 'MEDIUM';
        this.newTaskStartDate = '';
        this.newTaskDueDate = '';
        this.newTaskAssigneeId = '';
        this.loadTasks();
        if (this.userRole() === 'MANAGER') {
          this.loadManagerTasks();
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.taskError.set('Failed to create task. Check the assignee ID.');
        this.isLoading.set(false);
      }
    });
  }

  // Add this property for the footer year
currentYear = new Date().getFullYear();

  private setTaskChoices(list: TaskItem[]) {
    list.forEach(t => {
      if (!t?.id) return;
      this.statusChoice[t.id] = t.status || 'PENDING';
      this.priorityChoice[t.id] = t.priority || 'MEDIUM';
    });
  }

  private sortTasks(list: TaskItem[]): TaskItem[] {
    return [...list].sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;

      const aStatus = this.statusOrder[a.status] ?? 99;
      const bStatus = this.statusOrder[b.status] ?? 99;
      if (aStatus !== bStatus) return aStatus - bStatus;

      const aPr = this.priorityOrder[a.priority || 'MEDIUM'] ?? 99;
      const bPr = this.priorityOrder[b.priority || 'MEDIUM'] ?? 99;
      if (aPr !== bPr) return aPr - bPr;

      return (a.id || 0) - (b.id || 0);
    });
  }

  /* =========================
     UI HELPERS
     ========================= */

  // Returns Tailwind classes based on task status
  statusClass(status: string) {
    return {
      'text-yellow-600 bg-yellow-50 border-yellow-200': status === 'PENDING',
      'text-blue-600 bg-blue-50 border-blue-200': status === 'IN_PROGRESS',
      'text-green-600 bg-green-50 border-green-200': status === 'COMPLETED'
    };
  }

  // UI-only delete (backend integration later)
  deleteTask(id: number) {
    const token = this.token();
    if (!token) return;

    this.api.deleteTask(id, token).subscribe({
      next: () => {
        this.taskMessage.set('Task removed.');
        this.loadTasks();
        if (this.userRole() === 'MANAGER') {
          this.loadManagerTasks();
        }
      },
      error: () => {
        this.taskError.set('Failed to remove task.');
      }
    });
  }

  // UI-only update (backend integration later)
  updateTask(id: number, status: string | null, priority: string | null) {
    const token = this.token();
    if (!token) return;

    this.api.updateTask(id, status, priority, token).subscribe({
      next: () => {
        this.taskMessage.set('Task updated.');
        this.loadTasks();
        if (this.userRole() === 'MANAGER') {
          this.loadManagerTasks();
        }
      },
      error: () => {
        this.taskError.set('Failed to update task.');
      }
    });
  }
}
