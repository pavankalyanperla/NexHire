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
    { label: 'Dashboard',   icon: 'pi pi-home',       link: '/admin' },
    { label: 'Employees',   icon: 'pi pi-users',      link: '/admin/employees' },
    { label: 'Payroll',     icon: 'pi pi-wallet',     link: '/admin/payroll' },
    { label: 'Reports',     icon: 'pi pi-chart-bar',  link: '/admin/reports' },
    { label: 'Settings',    icon: 'pi pi-cog',        link: '/admin/settings' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
