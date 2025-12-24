import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html'
})
export class AuthPageComponent implements OnInit {
  private state = inject(AppStateService);
  private router = inject(Router);

  mode: 'login' | 'signup' = 'login';
  email = '';
  password = '';
  fullName = '';
  role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'TEAM_LEAD' = 'EMPLOYEE';
  error = '';
  message = '';
  loading = false;

  ngOnInit(): void {
    if (this.state.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  toggle(mode: 'login' | 'signup') {
    this.mode = mode;
    this.error = '';
    this.message = '';
  }

  doSignup() {
    this.error = '';
    this.message = '';
    if (!this.fullName || !this.email || !this.password) {
      this.error = 'Full name, email, and password are required.';
      return;
    }
    this.loading = true;
    this.state.signup(this.fullName.trim(), this.email.trim(), this.password, this.role)
      .subscribe({
        next: () => {
          this.message = 'Account created. Please log in.';
          this.loading = false;
          this.mode = 'login';
        },
        error: () => {
          this.error = 'Signup failed. Try a different email.';
          this.loading = false;
        }
      });
  }

  doLogin() {
    this.error = '';
    this.message = '';
    if (!this.email || !this.password) {
      this.error = 'Email and password are required.';
      return;
    }
    this.loading = true;
    this.state.login(this.email, this.password).subscribe({
      next: res => {
        this.state.handleLoginResponse(res);
        this.loading = false;
        // redirect based on role
        const role = res.role;
        if (role === 'MANAGER') this.router.navigate(['/manager']);
        else if (role === 'TEAM_LEAD') this.router.navigate(['/team-lead']);
        else if (role === 'ADMIN') this.router.navigate(['/admin']);
        else this.router.navigate(['/employee']);
      },
      error: () => {
        this.error = 'Login failed. Check your credentials.';
        this.loading = false;
      }
    });
  }
}
