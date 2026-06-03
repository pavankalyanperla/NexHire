import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';

@Component({
  selector: 'app-reports',
  standalone: false,
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2><i class="pi pi-chart-bar" style="margin-right:0.5rem;color:#6366f1"></i>Reports & Analytics</h2>
      </div>

      <div *ngIf="loading" class="loading-state">
        <p-progressSpinner></p-progressSpinner>
      </div>

      <div *ngIf="!loading" class="stats-grid">
        <div class="stat-card blue">
          <i class="pi pi-users stat-icon"></i>
          <div class="stat-body">
            <div class="stat-value">{{ totalEmployees }}</div>
            <div class="stat-label">Total Employees</div>
          </div>
        </div>
        <div class="stat-card green">
          <i class="pi pi-check-circle stat-icon"></i>
          <div class="stat-body">
            <div class="stat-value">{{ activeEmployees }}</div>
            <div class="stat-label">Active Employees</div>
          </div>
        </div>
        <div class="stat-card orange">
          <i class="pi pi-calendar-check stat-icon"></i>
          <div class="stat-body">
            <div class="stat-value">{{ presentToday }}</div>
            <div class="stat-label">Present Today</div>
          </div>
        </div>
        <div class="stat-card purple">
          <i class="pi pi-percentage stat-icon"></i>
          <div class="stat-body">
            <div class="stat-value">{{ attendanceRate }}%</div>
            <div class="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading" class="dashboard-grid" style="margin-top:1.5rem">
        <p-card header="Payroll Summary">
          <div class="payroll-total">{{ formatSalary(payrollTotal) }}</div>
          <p style="text-align:center;color:#6b7280;font-size:0.875rem">Total payroll this month</p>
        </p-card>
        <p-card header="Attendance Breakdown">
          <div class="attendance-split">
            <div class="att-block present">
              <div class="att-num">{{ presentToday }}</div>
              <div class="att-lbl">Present</div>
            </div>
            <div class="att-divider"></div>
            <div class="att-block absent">
              <div class="att-num">{{ totalEmployees - presentToday }}</div>
              <div class="att-lbl">Absent / On Leave</div>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit, AfterViewInit {
  totalEmployees = 0;
  activeEmployees = 0;
  presentToday = 0;
  attendanceRate = 0;
  payrollTotal = 0;
  loading = true;
  dataLoaded = false;

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadReports(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.loadReports(); }, 100);
  }

  loadReports() {
    this.loading = true;
    this.hrms.getCompanyOverview().subscribe({
      next: data => {
        this.totalEmployees  = data.totalEmployees;
        this.activeEmployees = data.activeEmployees;
        this.presentToday    = data.presentToday;
        this.attendanceRate  = data.attendanceRate;
        this.payrollTotal    = data.payrollThisMonth;
        this.loading         = false;
        this.dataLoaded      = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  formatSalary(amount: number): string {
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
    return '₹' + amount;
  }
}
