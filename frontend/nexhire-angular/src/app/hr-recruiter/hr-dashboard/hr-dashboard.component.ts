import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { HrOverviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-hr-dashboard', templateUrl: './hr-dashboard.component.html', standalone: false })
export class HRDashboardComponent implements OnInit, AfterViewInit {
  overview: HrOverviewDto | null = null;
  loading = true;
  dataLoaded = false;

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.hrms.getHrOverview().subscribe({
      next: o => {
        this.overview = o;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  maxDeptCount(): number {
    return Math.max(1, ...(this.overview?.departmentBreakdown.map(d => d.count) ?? [1]));
  }

  deptPct(count: number): number {
    return Math.round((count / this.maxDeptCount()) * 100);
  }
}
