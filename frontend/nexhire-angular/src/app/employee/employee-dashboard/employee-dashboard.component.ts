import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeDto, AttendanceDto, PayrollRecordDto, PerformanceReviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-employee-dashboard', templateUrl: './employee-dashboard.component.html', standalone: false })
export class EmployeeDashboardComponent implements OnInit {
  employee: EmployeeDto | null = null;
  todayRecord: AttendanceDto | null = null;
  payslip: PayrollRecordDto | null = null;
  reviews: PerformanceReviewDto[] = [];
  loading = true;
  actionLoading = false;
  now = new Date();

  get lastRating() { return this.reviews.length > 0 ? this.reviews[this.reviews.length - 1].selfRating : null; }
  get checkedIn() { return !!this.todayRecord?.checkInTime; }
  get checkedOut() { return !!this.todayRecord?.checkOutTime; }

  constructor(private hrms: HrmsService, private auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }

    this.hrms.getEmployeeByUserId(userId).subscribe(emp => {
      this.employee = emp;
      const eId = emp.id;
      const m = this.now.getMonth() + 1;
      const y = this.now.getFullYear();

      Promise.all([
        this.hrms.getTodayAttendance().toPromise(),
        this.hrms.getPayslip(eId, m, y).toPromise(),
        this.hrms.getMyReviews(eId).toPromise()
      ]).then(([att, pay, revs]) => {
        this.todayRecord = (att || []).find(a => a.employeeId === eId) || null;
        this.payslip     = pay || null;
        this.reviews     = revs || [];
        this.loading     = false;
      }).catch(() => this.loading = false);
    }, () => this.loading = false);
  }

  checkIn() {
    if (!this.employee) return;
    this.actionLoading = true;
    this.hrms.checkIn(this.employee.id).subscribe({ next: r => { this.todayRecord = r; this.actionLoading = false; }, error: (e) => { alert(e.error?.message || 'Check-in failed'); this.actionLoading = false; } });
  }

  checkOut() {
    if (!this.employee) return;
    this.actionLoading = true;
    this.hrms.checkOut(this.employee.id).subscribe({ next: r => { this.todayRecord = r; this.actionLoading = false; }, error: (e) => { alert(e.error?.message || 'Check-out failed'); this.actionLoading = false; } });
  }
}
