import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeDto, AttendanceDto, EmployeeOverviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-employee-dashboard', templateUrl: './employee-dashboard.component.html', standalone: false })
export class EmployeeDashboardComponent implements OnInit {
  employee: EmployeeDto | null = null;
  todayRecord: AttendanceDto | null = null;
  overview: EmployeeOverviewDto | null = null;
  loading = true;
  actionLoading = false;

  get checkedIn() { return !!this.todayRecord?.checkInTime; }
  get checkedOut() { return !!this.todayRecord?.checkOutTime; }

  constructor(private hrms: HrmsService, private auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }

    this.hrms.getEmployeeByUserId(userId).subscribe(emp => {
      this.employee = emp;
      Promise.all([
        this.hrms.getTodayAttendance().toPromise(),
        this.hrms.getEmployeeOverview(emp.id).toPromise()
      ]).then(([att, ov]) => {
        this.todayRecord = (att ?? []).find(a => a.employeeId === emp.id) ?? null;
        this.overview    = ov ?? null;
        this.loading     = false;
      }).catch(() => this.loading = false);
    }, () => this.loading = false);
  }

  checkIn() {
    if (!this.employee) return;
    this.actionLoading = true;
    this.hrms.checkIn(this.employee.id).subscribe({
      next: r => { this.todayRecord = r; this.actionLoading = false; },
      error: (e) => { alert(e.error?.message || 'Check-in failed'); this.actionLoading = false; }
    });
  }

  checkOut() {
    if (!this.employee) return;
    this.actionLoading = true;
    this.hrms.checkOut(this.employee.id).subscribe({
      next: r => { this.todayRecord = r; this.actionLoading = false; },
      error: (e) => { alert(e.error?.message || 'Check-out failed'); this.actionLoading = false; }
    });
  }

  formatSalary(amount: number): string {
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
    return '₹' + amount;
  }

  ratingStars(): number[] { return [1,2,3,4,5]; }
}
