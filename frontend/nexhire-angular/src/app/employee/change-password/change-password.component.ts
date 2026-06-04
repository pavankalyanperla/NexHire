import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-change-password',
  standalone: false,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Change Password</h2>
      </div>
      <p-card styleClass="change-pw-card" [style]="{maxWidth:'480px',margin:'0 auto'}">
        <div class="form-field" style="margin-bottom:16px">
          <label style="display:block;margin-bottom:6px;font-weight:500">Current Password</label>
          <p-password [(ngModel)]="currentPassword" [feedback]="false"
                      [toggleMask]="true" styleClass="w-full">
          </p-password>
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <label style="display:block;margin-bottom:6px;font-weight:500">New Password</label>
          <p-password [(ngModel)]="newPassword" [toggleMask]="true" styleClass="w-full">
          </p-password>
        </div>
        <div class="form-field" style="margin-bottom:20px">
          <label style="display:block;margin-bottom:6px;font-weight:500">Confirm New Password</label>
          <p-password [(ngModel)]="confirmPassword" [feedback]="false"
                      [toggleMask]="true" styleClass="w-full">
          </p-password>
        </div>
        <p *ngIf="errorMsg" style="color:#dc2626;margin-bottom:12px">
          <i class="pi pi-exclamation-triangle"></i> {{errorMsg}}
        </p>
        <p *ngIf="successMsg" style="color:#16a34a;margin-bottom:12px">
          <i class="pi pi-check-circle"></i> {{successMsg}}
        </p>
        <p-button label="Change Password" icon="pi pi-lock"
                  [loading]="loading" (onClick)="changePassword()">
        </p-button>
      </p-card>
    </div>
  `
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword     = '';
  confirmPassword = '';
  loading         = false;
  errorMsg        = '';
  successMsg      = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  changePassword() {
    this.errorMsg   = '';
    this.successMsg = '';

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'All fields are required.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'New passwords do not match.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMsg = 'New password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      currentPassword: this.currentPassword,
      newPassword:     this.newPassword
    }).subscribe({
      next: () => {
        this.successMsg      = 'Password changed successfully!';
        this.loading         = false;
        this.currentPassword = '';
        this.newPassword     = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Failed to change password.';
        this.loading  = false;
        this.cdr.detectChanges();
      }
    });
  }
}
