import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { PayrollRecordDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-payslips', templateUrl: './my-payslips.component.html', standalone: false })
export class MyPayslipsComponent implements OnInit {
  payslip: PayrollRecordDto | null = null;
  employeeId = 0;
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  loading = true;
  notFound = false;
  months = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ label: new Date(2000, m-1).toLocaleString('default',{month:'long'}), value: m }));
  years = [2025, 2026];

  constructor(private hrms: HrmsService, private auth: AuthService) {}
  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe(emp => { this.employeeId = emp.id; this.load(); });
  }
  load() {
    this.loading = true;
    this.notFound = false;
    this.hrms.getPayslip(this.employeeId, this.month, this.year).subscribe({
      next: p => { this.payslip = p; this.loading = false; },
      error: () => { this.payslip = null; this.notFound = true; this.loading = false; }
    });
  }
  monthName(m: number) { return new Date(2000, m-1).toLocaleString('default', { month: 'long' }); }
}
