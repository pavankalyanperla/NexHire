import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AttendanceDto, AttendanceSummaryDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-attendance-overview', templateUrl: './attendance-overview.component.html', standalone: false })
export class AttendanceOverviewComponent implements OnInit, AfterViewInit {
  todayAttendance: AttendanceDto[] = [];
  monthlySummary: AttendanceSummaryDto[] = [];
  loading = true;
  dataLoaded = false;
  now = new Date();

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    Promise.all([
      this.hrms.getTodayAttendance().toPromise(),
      this.hrms.getMonthlySummary(this.now.getMonth() + 1, this.now.getFullYear()).toPromise()
    ]).then(([att, summary]) => {
      this.todayAttendance = att || [];
      this.monthlySummary  = summary || [];
      this.loading         = false;
      this.dataLoaded      = true;
      this.cdr.detectChanges();
    }).catch(() => { this.loading = false; this.cdr.detectChanges(); });
  }
}
