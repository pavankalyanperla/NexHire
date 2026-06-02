import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse, UserRole } from '../models/auth.model';

const TOKEN_KEY = 'nexhire_token';
const USER_KEY = 'nexhire_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem(TOKEN_KEY, response.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? (user.role as UserRole) : null;
  }

  getPortalRoute(): string {
    switch (this.getRole()) {
      case 'ManagementAdmin': return '/admin';
      case 'SeniorManager':   return '/manager';
      case 'HRRecruiter':     return '/hr';
      case 'Employee':        return '/employee';
      default:                return '/login';
    }
  }
}
