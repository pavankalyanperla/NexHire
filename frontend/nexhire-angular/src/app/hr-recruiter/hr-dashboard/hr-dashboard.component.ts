import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { HrOverviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-hr-dashboard', templateUrl: './hr-dashboard.component.html', standalone: false })
export class HRDashboardComponent implements OnInit {
  overview: HrOverviewDto | null = null;
  loading = true;

  constructor(private hrms: HrmsService) {}

  ngOnInit() {
    this.hrms.getHrOverview().subscribe({
      next: o => { this.overview = o; this.loading = false; },
      error: () => this.loading = false
    });
  }

  maxDeptCount(): number {
    return Math.max(1, ...(this.overview?.departmentBreakdown.map(d => d.count) ?? [1]));
  }
  deptPct(count: number): number {
    return Math.round((count / this.maxDeptCount()) * 100);
  }
}
