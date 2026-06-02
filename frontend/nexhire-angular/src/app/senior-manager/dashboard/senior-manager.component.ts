import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AuthResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-senior-manager',
  templateUrl: './senior-manager.component.html',
  styleUrls: ['./senior-manager.component.scss'],
  standalone: false
})
export class SeniorManagerComponent implements OnInit {
  user: AuthResponse | null = null;

  menuItems = [
    { label: 'Dashboard',   icon: 'pi pi-home',        link: '/manager' },
    { label: 'My Team',     icon: 'pi pi-users',       link: '/manager/team' },
    { label: 'Leave Approvals', icon: 'pi pi-check-circle', link: '/manager/leaves' },
    { label: 'Performance', icon: 'pi pi-star',        link: '/manager/performance' }
  ];

  constructor(private authService: AuthService) {}
  ngOnInit(): void { this.user = this.authService.getCurrentUser(); }
  logout(): void { this.authService.logout(); }
}
