import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'TaskAsk';
  tagline = 'Employee Task & Performance Management';
  currentYear = new Date().getFullYear();

  constructor(public state: AppStateService) {}

  ngOnInit(): void {
    this.state.restoreFromStorage();
  }

  logout() {
    this.state.logout();
  }
}
