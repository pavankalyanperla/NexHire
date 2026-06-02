import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { PayrollRecordDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-payroll-management', templateUrl: './payroll-management.component.html', standalone: false })
export class PayrollManagementComponent implements OnInit {
  payroll: PayrollRecordDto[] = [];
  month = new Date().getMonth() + 1;
  year  = new Date().getFullYear();
  loading = false;
  generating = false;

  months = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ label: new Date(2000, m-1).toLocaleString('default',{month:'long'}), value: m }));
  years  = [2025, 2026, 2027];

  constructor(private hrms: HrmsService) {}
  ngOnInit() { this.loadPayroll(); }

  loadPayroll() {
    this.loading = true;
    this.hrms.getMonthPayroll(this.month, this.year).subscribe({ next: p => { this.payroll = p; this.loading = false; }, error: () => this.loading = false });
  }

  generateBulk() {
    this.generating = true;
    this.hrms.generateBulkPayroll(this.month, this.year).subscribe({ next: p => { this.payroll = p; this.generating = false; }, error: () => this.generating = false });
  }

  get totalNet() { return this.payroll.reduce((s, p) => s + p.netSalary, 0); }
}
