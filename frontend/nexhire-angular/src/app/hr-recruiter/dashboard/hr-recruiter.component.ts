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
    { label: 'Dashboard',   icon: 'pi pi-home',       link: '/hr/dashboard' },
    { label: 'Employees',   icon: 'pi pi-users',      link: '/hr/employees' },
    { label: 'Attendance',  icon: 'pi pi-calendar',   link: '/hr/attendance' },
    { label: 'Job Postings',icon: 'pi pi-briefcase',  link: '/hr/jobs' },
    { label: 'Onboarding',      icon: 'pi pi-user-plus',     link: '/hr/onboarding' },
    { label: 'Leave Approvals', icon: 'pi pi-calendar-times', link: '/hr/leave-approvals' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
