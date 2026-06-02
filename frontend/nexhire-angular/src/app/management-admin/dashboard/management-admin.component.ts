import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-management-admin',
  templateUrl: './management-admin.component.html',
  styleUrls: ['./management-admin.component.scss'],
  standalone: false
})
export class ManagementAdminComponent implements OnInit {
  user: AuthResponse | null = null;
  sidebarVisible = true;

  menuItems: MenuItem[] = [
    { label: 'Dashboard',   icon: 'pi pi-home',       routerLink: '/admin' },
    { label: 'Employees',   icon: 'pi pi-users',      routerLink: '/admin/employees' },
    { label: 'Departments', icon: 'pi pi-building',   routerLink: '/admin/departments' },
    { label: 'Reports',     icon: 'pi pi-chart-bar',  routerLink: '/admin/reports' },
    { label: 'Settings',    icon: 'pi pi-cog',        routerLink: '/admin/settings' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
