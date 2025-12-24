import { Injectable, computed, signal } from '@angular/core';
import {
  ApiService,
  CreateTaskRequest,
  EmployeeOption,
  LoginResponse,
  NotificationItem,
  PerformanceSummary,
  TaskItem,
  Team,
  TeamMember,
  TeamSummary,
  UserSummary
} from './api.service';

/**
 * Centralised application state + API calls.
 * Components subscribe to these signals so we avoid duplicating logic per page.
 */
@Injectable({ providedIn: 'root' })
export class AppStateService {
  constructor(private api: ApiService) {}

  // ===== Session =====
  readonly token = signal('');
  readonly userId = signal<number | null>(null);
  readonly userEmail = signal('');
  readonly userRole = signal<string>('');
  readonly isLoggedIn = computed(() => !!this.token());

  // ===== Data caches =====
  readonly employees = signal<EmployeeOption[]>([]);
  readonly tasks = signal<TaskItem[]>([]);
  readonly managerTasks = signal<TaskItem[]>([]);
  readonly adminTasks = signal<TaskItem[]>([]);
  readonly adminUsers = signal<UserSummary[]>([]);
  readonly adminTeams = signal<TeamSummary[]>([]);
  readonly performance = signal<PerformanceSummary | null>(null);
  readonly team = signal<Team | null>(null);
  readonly teamMembers = signal<TeamMember[]>([]);

  // ===== NOTIFICATIONS =====
  // These signals power the notification bell in the header
  readonly notifications = signal<NotificationItem[]>([]);  // All notifications
  readonly unreadCount = signal<number>(0);                  // Badge count
  readonly showNotificationPanel = signal<boolean>(false);  // Dropdown visible?

  // ===== Messages (lightweight) =====
  readonly lastError = signal('');
  readonly lastMessage = signal('');

  restoreFromStorage() {
    // SSR/Node safety
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
    }
    const token = localStorage.getItem('taskask_token');
    const userId = localStorage.getItem('taskask_userId');
    const email = localStorage.getItem('taskask_email');
    const role = localStorage.getItem('taskask_role');
    if (token && userId) {
      this.token.set(token);
      this.userId.set(Number(userId));
      if (email) this.userEmail.set(email);
      if (role) this.userRole.set(role);
      this.loadRoleData(role);
    }
  }

  logout() {
    this.token.set('');
    this.userId.set(null);
    this.userEmail.set('');
    this.userRole.set('');
    this.employees.set([]);
    this.tasks.set([]);
    this.managerTasks.set([]);
    this.adminTasks.set([]);
    this.adminUsers.set([]);
    this.performance.set(null);
    this.team.set(null);
    this.teamMembers.set([]);
    // Clear notification state on logout
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.showNotificationPanel.set(false);
    this.lastError.set('');
    this.lastMessage.set('');
    localStorage.removeItem('taskask_token');
    localStorage.removeItem('taskask_userId');
    localStorage.removeItem('taskask_email');
    localStorage.removeItem('taskask_role');
  }

  signup(fullName: string, email: string, password: string, role: string) {
    return this.api.createUser({ fullName, email, password, role: role as any });
  }

  login(email: string, password: string) {
    return this.api.login(email, password);
  }

  handleLoginResponse(res: LoginResponse) {
    this.token.set(res.token);
    this.userId.set(res.userId);
    this.userEmail.set(res.email);
    this.userRole.set(res.role);
    localStorage.setItem('taskask_token', res.token);
    localStorage.setItem('taskask_userId', String(res.userId));
    localStorage.setItem('taskask_email', res.email);
    localStorage.setItem('taskask_role', res.role);
    this.loadRoleData(res.role);
  }

  loadRoleData(role: string | null) {
    if (!role) return;
    this.loadTasksForMe();
    // Load notifications for ALL roles (everyone can receive notifications)
    this.loadNotifications();
    this.loadUnreadCount();
    if (role === 'MANAGER' || role === 'TEAM_LEAD') {
      this.loadEmployees();
      this.loadManagerTasks();
    }
    if (role === 'TEAM_LEAD') {
      this.loadMyTeam();
      this.loadMyTeamMembers();
    }
    if (role === 'ADMIN') {
      this.loadAllTasks();
      this.loadAllUsers();
      this.loadPerformance();
      this.loadAllTeams();
    }
  }

  // ===== Loads =====
  loadEmployees() {
    const token = this.token();
    if (!token) return;
    this.api.getEmployees(token).subscribe({
      next: list => this.employees.set(list),
      error: () => this.lastError.set('Failed to load employees')
    });
  }

  loadTasksForMe() {
    const token = this.token();
    const uid = this.userId();
    if (!token || !uid) return;
    this.api.getTasksForUser(uid, token).subscribe({
      next: list => this.tasks.set(list),
      error: () => this.lastError.set('Failed to load tasks')
    });
  }

  loadManagerTasks() {
    const token = this.token();
    const uid = this.userId();
    if (!token || !uid) return;
    this.api.getTasksCreatedBy(uid, token).subscribe({
      next: list => this.managerTasks.set(list),
      error: () => this.lastError.set('Failed to load created tasks')
    });
  }

  loadAllTasks() {
    const token = this.token();
    if (!token) return;
    this.api.getAllTasks(token).subscribe({
      next: list => this.adminTasks.set(list),
      error: () => this.lastError.set('Failed to load all tasks')
    });
  }

  loadAllUsers() {
    const token = this.token();
    if (!token) return;
    this.api.getAllUsers(token).subscribe({
      next: list => this.adminUsers.set(list),
      error: () => this.lastError.set('Failed to load users')
    });
  }

  loadPerformance() {
    const token = this.token();
    if (!token) return;
    this.api.getPerformance(token).subscribe({
      next: data => this.performance.set(data),
      error: () => this.lastError.set('Failed to load performance')
    });
  }

  loadAllTeams() {
    const token = this.token();
    if (!token) return;
    this.api.getAllTeams(token).subscribe({
      next: list => this.adminTeams.set(list),
      error: () => this.lastError.set('Failed to load teams')
    });
  }

  loadMyTeam() {
    const token = this.token();
    if (!token) return;
    this.api.getMyTeam(token).subscribe({
      next: (t: Team) => this.team.set(t),
      error: () => {
        // ignore if none
      }
    });
  }

  loadMyTeamMembers() {
    const token = this.token();
    if (!token) return;
    this.api.getMyTeamMembers(token).subscribe({
      next: (list: TeamMember[]) => this.teamMembers.set(list),
      error: () => this.lastError.set('Failed to load team members')
    });
  }

  // ===== Mutations =====
  createTask(payload: CreateTaskRequest) {
    const token = this.token();
    if (!token) return;
    this.api.createTask(payload, token).subscribe({
      next: () => {
        this.lastMessage.set('Task created');
        this.loadTasksForMe();
        this.loadManagerTasks();
        this.loadAllTasks();
        // Refresh notifications (task assignment triggers notifications)
        this.refreshNotifications();
      },
      error: () => this.lastError.set('Failed to create task')
    });
  }

  updateTask(taskId: number, status: string | null, priority: string | null) {
    const token = this.token();
    if (!token) return;
    this.api.updateTask(taskId, status, priority, token).subscribe({
      next: () => {
        this.lastMessage.set('Task updated');
        // Always refresh my tasks
        this.loadTasksForMe();
        // Only refresh creator/manager/admin views if role allows
        const role = this.userRole();
        if (role === 'MANAGER' || role === 'TEAM_LEAD') {
          this.loadManagerTasks();
        }
        if (role === 'ADMIN') {
          this.loadAllTasks();
        }
        // Refresh notifications (task completion triggers notifications)
        this.refreshNotifications();
      },
      error: () => this.lastError.set('Failed to update task')
    });
  }

  deleteTask(taskId: number) {
    const token = this.token();
    if (!token) return;
    this.api.deleteTask(taskId, token).subscribe({
      next: () => {
        this.lastMessage.set('Task deleted');
        this.loadTasksForMe();
        this.loadManagerTasks();
        this.loadAllTasks();
      },
      error: () => this.lastError.set('Failed to delete task')
    });
  }

  createTeam(name: string) {
    const token = this.token();
    if (!token) return;
    this.api.createTeam(name, token).subscribe({
      next: (t: Team) => {
        this.team.set(t);
        this.lastMessage.set('Team created');
        this.loadMyTeamMembers();
      },
      error: () => this.lastError.set('Failed to create team')
    });
  }

  addTeamMember(userId: number) {
    const token = this.token();
    const team = this.team();
    if (!token || !team) {
      this.lastError.set('Create a team first');
      return;
    }
    this.api.addTeamMember(team.id, userId, token).subscribe({
      next: () => {
        this.lastMessage.set('Member added');
        this.loadMyTeamMembers();
      },
      error: () => this.lastError.set('Failed to add member')
    });
  }

  // ===== NOTIFICATION METHODS =====

  /**
   * Load all notifications for the current user.
   * Called on login and when refreshing notification list.
   */
  loadNotifications() {
    const token = this.token();
    if (!token) return;
    this.api.getNotifications(token).subscribe({
      next: (list: NotificationItem[]) => this.notifications.set(list),
      error: () => this.lastError.set('Failed to load notifications')
    });
  }

  /**
   * Load unread notification count.
   * Used to display the red badge number on the bell icon.
   */
  loadUnreadCount() {
    const token = this.token();
    if (!token) return;
    this.api.getUnreadCount(token).subscribe({
      next: (res) => this.unreadCount.set(res.count),
      error: () => {} // Silently fail for count
    });
  }

  /**
   * Toggle the notification dropdown panel visibility.
   * When opening, also mark all as read.
   */
  toggleNotificationPanel() {
    const newValue = !this.showNotificationPanel();
    this.showNotificationPanel.set(newValue);
    
    // When opening the panel, mark all as read
    if (newValue && this.unreadCount() > 0) {
      this.markAllNotificationsRead();
    }
  }

  /**
   * Close the notification panel (e.g., when clicking outside).
   */
  closeNotificationPanel() {
    this.showNotificationPanel.set(false);
  }

  /**
   * Mark all notifications as read.
   * Called when user opens the notification dropdown.
   */
  markAllNotificationsRead() {
    const token = this.token();
    if (!token) return;
    this.api.markNotificationsRead(token).subscribe({
      next: () => {
        // Reset unread count to 0
        this.unreadCount.set(0);
        // Refresh the notification list to show them as read
        this.loadNotifications();
      },
      error: () => this.lastError.set('Failed to mark notifications read')
    });
  }

  /**
   * Refresh notifications (can be called after task actions).
   */
  refreshNotifications() {
    this.loadNotifications();
    this.loadUnreadCount();
  }
}
