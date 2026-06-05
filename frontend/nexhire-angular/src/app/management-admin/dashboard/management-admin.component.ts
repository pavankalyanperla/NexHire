import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-management-admin',
  templateUrl: './management-admin.component.html',
  styleUrls: ['./management-admin.component.scss'],
  standalone: false
})
export class ManagementAdminComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems = [
    { label: 'Dashboard',       icon: 'pi pi-home',       link: '/admin/dashboard' },
    { label: 'Employees',       icon: 'pi pi-users',      link: '/admin/employees' },
    { label: 'User Management', icon: 'pi pi-id-card',    link: '/admin/users' },
    { label: 'Payroll',         icon: 'pi pi-wallet',     link: '/admin/payroll' },
    { label: 'Recruitment',     icon: 'pi pi-briefcase',  link: '/admin/recruitment' },
    { label: 'Reports',         icon: 'pi pi-chart-bar',  link: '/admin/reports' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
