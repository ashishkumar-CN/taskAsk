import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  status: string;
  startDate?: string | null;
  dueDate?: string | null;
  createdByUserId?: number;
  createdByName?: string;
  createdByRole?: string;
  assignedToUserId?: number;
  assignedToName?: string;
  assignedToRole?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EmployeeOption {
  id: number;
  fullName: string;
  email: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  createdByUserId: number;
  assignedToUserId: number;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'ADMIN' | 'TEAM_LEAD';
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
  role: 'MANAGER' | 'EMPLOYEE' | 'ADMIN' | 'TEAM_LEAD';
  active: boolean;
}

export interface UserPerformance {
  userId: number;
  fullName: string;
  email: string;
  totalTasks: number;
  completedTasks: number;
  completionRatePercent: number;
}

export interface PerformanceSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionRatePercent: number;
  userStats: UserPerformance[];
}

// Teams
export interface Team {
  id: number;
  name: string;
  leadId?: number;
  createdAt?: string;
}

export interface TeamSummary {
  id: number;
  name: string;
  leadId: number;
  leadName: string;
  leadEmail: string;
}

export interface TeamMember {
  userId: number;
  fullName: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  createUser(request: CreateUserRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/users`, request);
  }

  createTask(request: CreateTaskRequest, token: string): Observable<TaskItem> {
    return this.http.post<TaskItem>(`${this.baseUrl}/tasks`, request, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getEmployees(token: string): Observable<EmployeeOption[]> {
    return this.http.get<EmployeeOption[]>(`${this.baseUrl}/employees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  getTasksCreatedBy(managerId: number, token: string): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(
      `${this.baseUrl}/tasks/created/${managerId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  getTasksForUser(userId: number, token: string): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(
      `${this.baseUrl}/tasks/assigned/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  updateTask(taskId: number, status: string | null, priority: string | null, token: string): Observable<TaskItem> {
    return this.http.patch<TaskItem>(
      `${this.baseUrl}/tasks/${taskId}/status`,
      { status, priority },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  deleteTask(taskId: number, token: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Admin endpoints
  getAllTasks(token: string): Observable<TaskItem[]> {
    return this.http.get<TaskItem[]>(`${this.baseUrl}/admin/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getAllUsers(token: string): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${this.baseUrl}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getPerformance(token: string): Observable<PerformanceSummary> {
    return this.http.get<PerformanceSummary>(`${this.baseUrl}/admin/performance`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getAllTeams(token: string): Observable<TeamSummary[]> {
    return this.http.get<TeamSummary[]>(`${this.baseUrl}/admin/teams`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // Teams (TEAM_LEAD)
  getMyTeam(token: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/teams/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  createTeam(name: string, token: string): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/teams`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  addTeamMember(teamId: number, userId: number, token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/teams/${teamId}/members`, { userId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  getMyTeamMembers(token: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/teams/mine/members`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
