import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, AttendanceDto, LeaveRequestDto, PerformanceReviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-manager-dashboard', templateUrl: './manager-dashboard.component.html', standalone: false })
export class ManagerDashboardComponent implements OnInit {
  employees: EmployeeDto[] = [];
  todayAttendance: AttendanceDto[] = [];
  pendingLeaves: LeaveRequestDto[] = [];
  pendingReviews: PerformanceReviewDto[] = [];
  loading = true;

  constructor(private hrms: HrmsService) {}
  ngOnInit() {
    Promise.all([
      this.hrms.getEmployees().toPromise(),
      this.hrms.getTodayAttendance().toPromise(),
      this.hrms.getPendingLeaves().toPromise(),
      this.hrms.getPendingReviews().toPromise()
    ]).then(([emps, att, leaves, reviews]) => {
      this.employees      = emps || [];
      this.todayAttendance= att || [];
      this.pendingLeaves  = leaves || [];
      this.pendingReviews = reviews || [];
      this.loading = false;
    }).catch(() => this.loading = false);
  }
}
