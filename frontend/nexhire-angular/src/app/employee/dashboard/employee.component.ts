import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
  standalone: false
})
export class EmployeeComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems = [
    { label: 'Dashboard',   icon: 'pi pi-home',       link: '/employee' },
    { label: 'Attendance',  icon: 'pi pi-calendar',   link: '/employee/attendance' },
    { label: 'Payslips',    icon: 'pi pi-wallet',     link: '/employee/payslips' },
    { label: 'Leaves',      icon: 'pi pi-clock',      link: '/employee/leaves' },
    { label: 'Performance', icon: 'pi pi-star',       link: '/employee/performance' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
