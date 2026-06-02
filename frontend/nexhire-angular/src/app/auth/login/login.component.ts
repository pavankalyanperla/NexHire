import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  quickLogins = [
    { label: 'Management Admin', email: 'admin@nexhire.com', password: 'Admin@123', icon: 'pi pi-shield', role: 'ManagementAdmin' },
    { label: 'Senior Manager',   email: 'manager@nexhire.com', password: 'Manager@123', icon: 'pi pi-users', role: 'SeniorManager' },
    { label: 'HR Recruiter',     email: 'hr@nexhire.com', password: 'HR@123', icon: 'pi pi-briefcase', role: 'HRRecruiter' },
    { label: 'Employee',         email: 'employee@nexhire.com', password: 'Employee@123', icon: 'pi pi-user', role: 'Employee' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.doLogin(this.loginForm.value.email, this.loginForm.value.password);
  }

  quickLogin(entry: { email: string; password: string }): void {
    this.doLogin(entry.email, entry.password);
  }

  private doLogin(email: string, password: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([this.authService.getPortalRoute()]);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}
