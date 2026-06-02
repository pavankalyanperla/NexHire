import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, DepartmentSummary, LeaveRequestDto, PayrollRecordDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-admin-dashboard', templateUrl: './admin-dashboard.component.html', standalone: false })
export class AdminDashboardComponent implements OnInit {
  employees: EmployeeDto[] = [];
  deptSummary: DepartmentSummary[] = [];
  pendingLeaves: LeaveRequestDto[] = [];
  payroll: PayrollRecordDto[] = [];
  loading = true;

  get activeCount() { return this.employees.filter(e => e.status === 'Active').length; }
  get onLeaveCount() { return this.pendingLeaves.length; }

  constructor(private hrms: HrmsService) {}

  ngOnInit(): void {
    const now = new Date();
    Promise.all([
      this.hrms.getEmployees().toPromise(),
      this.hrms.getDepartmentSummary().toPromise(),
      this.hrms.getPendingLeaves().toPromise(),
      this.hrms.getMonthPayroll(now.getMonth() + 1, now.getFullYear()).toPromise()
    ]).then(([emps, depts, leaves, pay]) => {
      this.employees    = emps || [];
      this.deptSummary  = depts || [];
      this.pendingLeaves= (leaves || []).slice(0, 5);
      this.payroll      = pay || [];
      this.loading      = false;
    }).catch(() => this.loading = false);
  }
}
