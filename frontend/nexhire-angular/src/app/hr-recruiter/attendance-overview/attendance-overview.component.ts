import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AttendanceDto, AttendanceSummaryDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-attendance-overview', templateUrl: './attendance-overview.component.html', standalone: false })
export class AttendanceOverviewComponent implements OnInit {
  todayAttendance: AttendanceDto[] = [];
  monthlySummary: AttendanceSummaryDto[] = [];
  loading = true;
  now = new Date();

  constructor(private hrms: HrmsService) {}
  ngOnInit() {
    Promise.all([
      this.hrms.getTodayAttendance().toPromise(),
      this.hrms.getMonthlySummary(this.now.getMonth() + 1, this.now.getFullYear()).toPromise()
    ]).then(([att, summary]) => { this.todayAttendance = att || []; this.monthlySummary = summary || []; this.loading = false; })
      .catch(() => this.loading = false);
  }
}
