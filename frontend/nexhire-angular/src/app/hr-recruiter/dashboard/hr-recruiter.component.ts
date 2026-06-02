import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-hr-recruiter',
  templateUrl: './hr-recruiter.component.html',
  styleUrls: ['./hr-recruiter.component.scss'],
  standalone: false
})
export class HRRecruiterComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard',    icon: 'pi pi-home',       routerLink: '/hr' },
    { label: 'Jobs',         icon: 'pi pi-briefcase',  routerLink: '/hr/jobs' },
    { label: 'Candidates',   icon: 'pi pi-users',      routerLink: '/hr/candidates' },
    { label: 'Interviews',   icon: 'pi pi-calendar',   routerLink: '/hr/interviews' },
    { label: 'Onboarding',   icon: 'pi pi-user-plus',  routerLink: '/hr/onboarding' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
