import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { CompanyOverviewDto, RecruitmentStatsDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-admin-dashboard', templateUrl: './admin-dashboard.component.html', standalone: false })
export class AdminDashboardComponent implements OnInit {
  overview: CompanyOverviewDto | null = null;
  recruitment: RecruitmentStatsDto | null = null;
  loading = true;

  constructor(private hrms: HrmsService) {}

  ngOnInit(): void {
    this.hrms.getCompanyOverview().subscribe({
      next: o => {
        this.overview = o;
        this.hrms.getRecruitmentStats().subscribe({
          next: r => { this.recruitment = r; this.loading = false; },
          error: () => this.loading = false
        });
      },
      error: () => this.loading = false
    });
  }

  maxDeptCount(): number {
    return Math.max(1, ...(this.overview?.departmentBreakdown.map(d => d.count) ?? [1]));
  }

  deptPct(count: number): number {
    return Math.round((count / this.maxDeptCount()) * 100);
  }

  formatSalary(amount: number): string {
    if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
    if (amount >= 1000) return '₹' + (amount / 1000).toFixed(0) + 'K';
    return '₹' + amount;
  }
}
