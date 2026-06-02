import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole: string | undefined = route.data['role'];
    const userRole = this.authService.getRole();

    if (requiredRole && userRole !== requiredRole) {
      this.router.navigate([this.authService.getPortalRoute()]);
      return false;
    }

    return true;
  }
}
