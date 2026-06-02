import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-senior-manager',
  templateUrl: './senior-manager.component.html',
  styleUrls: ['./senior-manager.component.scss'],
  standalone: false
})
export class SeniorManagerComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems: MenuItem[] = [
    { label: 'Dashboard',   icon: 'pi pi-home',      routerLink: '/manager' },
    { label: 'My Team',     icon: 'pi pi-users',     routerLink: '/manager/team' },
    { label: 'Performance', icon: 'pi pi-chart-line', routerLink: '/manager/performance' },
    { label: 'Approvals',   icon: 'pi pi-check-circle', routerLink: '/manager/approvals' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
}
