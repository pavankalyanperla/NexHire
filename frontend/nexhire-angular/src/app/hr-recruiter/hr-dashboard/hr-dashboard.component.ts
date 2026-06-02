import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { EmployeeDto, LeaveRequestDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-hr-dashboard', templateUrl: './hr-dashboard.component.html', standalone: false })
export class HRDashboardComponent implements OnInit {
  employees: EmployeeDto[] = [];
  pendingLeaves: LeaveRequestDto[] = [];
  loading = true;
  now = new Date();

  get newThisMonth() {
    return this.employees.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === this.now.getMonth() && d.getFullYear() === this.now.getFullYear();
    }).length;
  }

  constructor(private hrms: HrmsService) {}
  ngOnInit() {
    Promise.all([this.hrms.getEmployees().toPromise(), this.hrms.getPendingLeaves().toPromise()])
      .then(([emps, leaves]) => { this.employees = emps || []; this.pendingLeaves = leaves || []; this.loading = false; })
      .catch(() => this.loading = false);
  }
}
