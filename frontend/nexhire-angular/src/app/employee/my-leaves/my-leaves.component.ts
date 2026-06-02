import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequestDto, CreateLeaveDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-leaves', templateUrl: './my-leaves.component.html', standalone: false })
export class MyLeavesComponent implements OnInit {
  leaves: LeaveRequestDto[] = [];
  employeeId = 0;
  loading = true;
  showDialog = false;
  form: CreateLeaveDto = this.empty();
  leaveTypes = ['Sick', 'Casual', 'Annual'];
  getSeverity(s: string) { return s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'warn'; }

  constructor(private hrms: HrmsService, private auth: AuthService) {}
  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe(emp => { this.employeeId = emp.id; this.load(); });
  }
  load() { this.hrms.getMyLeaves(this.employeeId).subscribe({ next: l => { this.leaves = l; this.loading = false; }, error: () => this.loading = false }); }
  openApply() { this.form = this.empty(); this.showDialog = true; }
  apply() {
    this.hrms.applyLeave(this.form).subscribe(() => { this.showDialog = false; this.load(); });
  }
  private empty(): CreateLeaveDto { return { employeeId: this.employeeId, fromDate: '', toDate: '', leaveType: 'Sick', reason: '' }; }
}
