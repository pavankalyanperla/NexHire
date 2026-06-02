import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  standalone: false
})
export class EmployeeComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard',    icon: 'pi pi-home',       routerLink: '/employee' },
    { label: 'My Profile',   icon: 'pi pi-user',       routerLink: '/employee/profile' },
    { label: 'Attendance',   icon: 'pi pi-calendar',   routerLink: '/employee/attendance' },
    { label: 'Payslips',     icon: 'pi pi-wallet',     routerLink: '/employee/payslips' },
    { label: 'Performance',  icon: 'pi pi-chart-line', routerLink: '/employee/performance' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
