import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { ManagerOverviewDto, AttendanceDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-manager-dashboard', templateUrl: './manager-dashboard.component.html', standalone: false })
export class ManagerDashboardComponent implements OnInit, AfterViewInit {
  overview: ManagerOverviewDto | null = null;
  todayAttendance: AttendanceDto[] = [];
  loading = true;
  dataLoaded = false;

  constructor(private hrms: HrmsService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }

    this.loading = true;
    Promise.all([
      this.hrms.getManagerOverview(userId).toPromise(),
      this.hrms.getTodayAttendance().toPromise()
    ]).then(([ov, att]) => {
      this.overview        = ov ?? null;
      this.todayAttendance = att ?? [];
      this.loading         = false;
      this.dataLoaded      = true;
      this.cdr.detectChanges();
    }).catch(() => { this.loading = false; this.cdr.detectChanges(); });
  }

  ratingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
