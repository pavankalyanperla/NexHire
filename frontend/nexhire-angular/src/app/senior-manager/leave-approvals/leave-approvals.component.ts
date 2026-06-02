import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { LeaveRequestDto } from '../../core/models/hrms.model';
import { AuthService } from '../../core/services/auth.service';

@Component({ selector: 'app-leave-approvals', templateUrl: './leave-approvals.component.html', standalone: false })
export class LeaveApprovalsComponent implements OnInit {
  leaves: LeaveRequestDto[] = [];
  loading = true;
  processing = 0;

  constructor(private hrms: HrmsService, private auth: AuthService) {}
  ngOnInit() { this.load(); }
  load() {
    this.hrms.getPendingLeaves().subscribe({ next: l => { this.leaves = l; this.loading = false; }, error: () => this.loading = false });
  }
  approve(id: number) {
    this.processing = id;
    const userId = this.auth.getCurrentUser()?.userId || 0;
    this.hrms.updateLeaveStatus(id, { status: 'Approved', approvedByUserId: userId }).subscribe(() => { this.processing = 0; this.load(); });
  }
  reject(id: number) {
    this.processing = id;
    const userId = this.auth.getCurrentUser()?.userId || 0;
    this.hrms.updateLeaveStatus(id, { status: 'Rejected', approvedByUserId: userId }).subscribe(() => { this.processing = 0; this.load(); });
  }
}
