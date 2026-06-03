import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { LeaveRequestDto, CreateLeaveDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-leaves', templateUrl: './my-leaves.component.html', standalone: false })
export class MyLeavesComponent implements OnInit, AfterViewInit {
  leaves: LeaveRequestDto[] = [];
  employeeId = 0;
  loading = true;
  showDialog = false;
  dataLoaded = false;
  form: CreateLeaveDto = this.empty();
  leaveTypes = ['Sick', 'Casual', 'Annual'];
  getSeverity(s: string) { return s === 'Approved' ? 'success' : s === 'Rejected' ? 'danger' : 'warn'; }

  constructor(private hrms: HrmsService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.initLoad(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.initLoad(); }, 100);
  }

  initLoad() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe({
      next: emp => { this.employeeId = emp.id; this.load(); },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  load() {
    this.hrms.getMyLeaves(this.employeeId).subscribe({
      next: l => {
        this.leaves = l;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openApply() { this.form = this.empty(); this.showDialog = true; }

  apply() {
    this.hrms.applyLeave(this.form).subscribe(() => {
      this.showDialog = false;
      this.dataLoaded = false;
      this.load();
    });
  }

  private empty(): CreateLeaveDto {
    return { employeeId: this.employeeId, fromDate: '', toDate: '', leaveType: 'Sick', reason: '' };
  }
}
