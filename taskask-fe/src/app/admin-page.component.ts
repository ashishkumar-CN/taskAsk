import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './admin-page.component.html'
})
export class AdminPageComponent implements OnInit {
  state = inject(AppStateService);

  get tasks() { return this.state.adminTasks(); }
  get users() { return this.state.adminUsers(); }
  get perf() { return this.state.performance(); }
  get teams() { return this.state.adminTeams(); }

  ngOnInit(): void {
    this.state.loadAllTasks();
    this.state.loadAllUsers();
    this.state.loadPerformance();
    this.state.loadAllTeams();
  }
}
