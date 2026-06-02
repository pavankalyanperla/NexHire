import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-attendance', templateUrl: './my-attendance.component.html', standalone: false })
export class MyAttendanceComponent implements OnInit {
  records: AttendanceDto[] = [];
  employeeId = 0;
  month = new Date().getMonth() + 1;
  year = new Date().getFullYear();
  loading = true;
  months = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ label: new Date(2000, m-1).toLocaleString('default',{month:'long'}), value: m }));
  years = [2025, 2026];

  get presentDays() { return this.records.filter(r => r.status === 'Present').length; }
  get absentDays()  { return this.records.filter(r => r.status === 'Absent').length; }
  get leaveDays()   { return this.records.filter(r => r.status === 'Leave').length; }
  getSeverity(s: string) { return s === 'Present' ? 'success' : s === 'Absent' ? 'danger' : 'warn'; }

  constructor(private hrms: HrmsService, private auth: AuthService) {}
  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe(emp => { this.employeeId = emp.id; this.load(); });
  }
  load() {
    this.loading = true;
    this.hrms.getEmployeeAttendance(this.employeeId, this.month, this.year).subscribe({ next: r => { this.records = r; this.loading = false; }, error: () => this.loading = false });
  }
}
