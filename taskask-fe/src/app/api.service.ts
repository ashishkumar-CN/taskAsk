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
  assignedToUserId?: number;
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
  role: 'MANAGER' | 'EMPLOYEE';
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
}
