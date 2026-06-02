import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-hr-recruiter',
  templateUrl: './hr-recruiter.component.html',
  styleUrls: ['./hr-recruiter.component.scss'],
  standalone: false
})
export class HRRecruiterComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems = [
    { label: 'Dashboard',   icon: 'pi pi-home',       link: '/hr' },
    { label: 'Employees',   icon: 'pi pi-users',      link: '/hr/employees' },
    { label: 'Attendance',  icon: 'pi pi-calendar',   link: '/hr/attendance' },
    { label: 'Interviews',  icon: 'pi pi-video',      link: '/hr/interviews' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
