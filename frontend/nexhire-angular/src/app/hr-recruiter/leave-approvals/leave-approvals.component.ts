import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { LeaveRequestDto } from '../../core/models/hrms.model';
import { AuthService } from '../../core/services/auth.service';

@Component({ selector: 'app-hr-leave-approvals', templateUrl: './leave-approvals.component.html', standalone: false })
export class HRLeaveApprovalsComponent implements OnInit, AfterViewInit {
  leaves: LeaveRequestDto[] = [];
  loading = true;
  processing = 0;
  dataLoaded = false;

  constructor(private hrms: HrmsService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.hrms.getPendingLeaves().subscribe({
      next: l => {
        this.leaves = l; // HR sees all departments
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  approve(id: number) {
    this.processing = id;
    const userId = this.auth.getCurrentUser()?.userId || 0;
    this.hrms.updateLeaveStatus(id, { status: 'Approved', approvedByUserId: userId }).subscribe({
      next: () => { this.processing = 0; this.dataLoaded = false; this.load(); }
    });
  }

  reject(id: number) {
    this.processing = id;
    const userId = this.auth.getCurrentUser()?.userId || 0;
    this.hrms.updateLeaveStatus(id, { status: 'Rejected', approvedByUserId: userId }).subscribe({
      next: () => { this.processing = 0; this.dataLoaded = false; this.load(); }
    });
  }
}
