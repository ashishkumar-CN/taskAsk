import { Routes } from '@angular/router';
import { AuthPageComponent } from './auth-page.component';
import { ManagerPageComponent } from './manager-page.component';
import { TeamLeadPageComponent } from './team-lead-page.component';
import { EmployeePageComponent } from './employee-page.component';
import { AdminPageComponent } from './admin-page.component';

export const routes: Routes = [
  { path: 'auth', component: AuthPageComponent },
  { path: 'manager', component: ManagerPageComponent },
  { path: 'team-lead', component: TeamLeadPageComponent },
  { path: 'employee', component: EmployeePageComponent },
  { path: 'admin', component: AdminPageComponent },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
  { path: '**', redirectTo: 'auth' }
];
