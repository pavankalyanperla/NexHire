import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { ManagerOverviewDto, AttendanceDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-manager-dashboard', templateUrl: './manager-dashboard.component.html', standalone: false })
export class ManagerDashboardComponent implements OnInit {
  overview: ManagerOverviewDto | null = null;
  todayAttendance: AttendanceDto[] = [];
  loading = true;

  constructor(private hrms: HrmsService, private auth: AuthService) {}

  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }

    Promise.all([
      this.hrms.getManagerOverview(userId).toPromise(),
      this.hrms.getTodayAttendance().toPromise()
    ]).then(([ov, att]) => {
      this.overview       = ov ?? null;
      this.todayAttendance= att ?? [];
      this.loading = false;
    }).catch(() => this.loading = false);
  }

  ratingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
