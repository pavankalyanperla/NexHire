import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  standalone: false
})
export class UserManagementComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  loading = true;
  dataLoaded = false;

  toastMsg = '';
  toastSeverity: 'success' | 'error' = 'success';
  showToastFlag = false;

  roleOptions = [
    { label: 'Employee',         value: 'Employee' },
    { label: 'HR Recruiter',     value: 'HRRecruiter' },
    { label: 'Senior Manager',   value: 'SeniorManager' },
    { label: 'Management Admin', value: 'ManagementAdmin' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }
  ngAfterViewInit() { setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100); }

  load() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/auth/users`).subscribe({
      next: data => {
        this.users = data;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  updateRole(user: any, newRole: string) {
    if (user.role === newRole) return;
    this.http.put(`${environment.apiUrl}/auth/users/${user.id}/role`,
      { role: newRole, department: user.department }
    ).subscribe({
      next: () => {
        user.role = newRole;
        this.showToast(`${user.fullName} role changed to ${newRole}`, 'success');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.showToast(err.error?.message || 'Failed to update role', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(user: any) {
    this.http.put(`${environment.apiUrl}/auth/users/${user.id}/toggle-status`, {}).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.showToast(
          `${user.fullName} ${user.isActive ? 'activated' : 'deactivated'}`, 'success');
        this.cdr.detectChanges();
      },
      error: () => {
        this.showToast('Failed to update status', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  roleSeverity(role: string): 'danger' | 'warn' | 'info' | 'success' {
    if (role === 'ManagementAdmin') return 'danger';
    if (role === 'SeniorManager')   return 'warn';
    if (role === 'HRRecruiter')     return 'info';
    return 'success';
  }

  showToast(msg: string, severity: 'success' | 'error') {
    this.toastMsg      = msg;
    this.toastSeverity = severity;
    this.showToastFlag = true;
    setTimeout(() => { this.showToastFlag = false; this.cdr.detectChanges(); }, 3500);
    this.cdr.detectChanges();
  }
}
