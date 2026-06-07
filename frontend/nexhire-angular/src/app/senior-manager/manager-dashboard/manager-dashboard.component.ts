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
    const user = this.auth.getCurrentUser();
    if (!user?.userId) { this.loading = false; return; }

    const myDept = (user.department || '').toLowerCase();
    console.log('Manager department:', user.department);

    this.loading = true;
    Promise.all([
      this.hrms.getManagerOverview(user.userId).toPromise(),
      this.hrms.getTodayAttendance().toPromise()
    ]).then(([ov, att]) => {
      this.overview = ov ?? null;

      const all: AttendanceDto[] = att ?? [];
      console.log('All attendance records:', all.length, '— sample:', all[0]);

      this.todayAttendance = myDept
        ? all.filter((a: AttendanceDto) => (a.department || '').toLowerCase() === myDept)
        : all;

      console.log('Filtered attendance for dept:', this.todayAttendance.length);

      this.loading    = false;
      this.dataLoaded = true;
      this.cdr.detectChanges();
    }).catch(() => { this.loading = false; this.cdr.detectChanges(); });
  }

  ratingStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
