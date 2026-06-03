import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeDto } from '../../core/models/hrms.model';

@Component({
  selector: 'app-my-team',
  standalone: false,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><i class="pi pi-users" style="margin-right:0.5rem;color:#6366f1"></i>My Team</h2>
        <span class="text-muted" *ngIf="!loading">{{ employees.length }} member{{ employees.length !== 1 ? 's' : '' }}</span>
      </div>

      <div *ngIf="loading" class="loading-state"><p-progressSpinner></p-progressSpinner></div>

      <p-table *ngIf="!loading" [value]="employees" stripedRows [tableStyle]="{'min-width': '50rem'}">
        <ng-template pTemplate="header">
          <tr>
            <th>Employee</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-emp>
          <tr>
            <td>
              <div style="display:flex;align-items:center;gap:0.75rem">
                <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0">
                  {{ emp.fullName.charAt(0) }}
                </div>
                <div>
                  <strong>{{ emp.fullName }}</strong><br>
                  <small class="text-muted">{{ emp.employeeCode }}</small>
                </div>
              </div>
            </td>
            <td>{{ emp.designation }}</td>
            <td>{{ emp.department }}</td>
            <td>{{ emp.email }}</td>
            <td>
              <p-tag [value]="emp.status" [severity]="emp.status === 'Active' ? 'success' : 'warn'"></p-tag>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="5" class="text-center empty-state">No team members found</td></tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class MyTeamComponent implements OnInit, AfterViewInit {
  employees: EmployeeDto[] = [];
  loading = true;
  dataLoaded = false;

  constructor(
    private hrms: HrmsService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.loadTeam(); }
  ngAfterViewInit() { setTimeout(() => { if (!this.dataLoaded) this.loadTeam(); }, 100); }

  loadTeam() {
    this.loading = true;
    this.hrms.getEmployees().subscribe({
      next: (data) => {
        const currentUser = this.auth.getCurrentUser();
        this.employees = currentUser?.department
          ? data.filter(e => e.department === currentUser.department)
          : data;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
