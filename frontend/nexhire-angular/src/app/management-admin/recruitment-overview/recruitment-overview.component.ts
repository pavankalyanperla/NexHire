import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { JobPostingDto } from '../../core/models/recruitment.model';

@Component({ selector: 'app-recruitment-overview', templateUrl: './recruitment-overview.component.html', standalone: false })
export class RecruitmentOverviewComponent implements OnInit {
  jobs: JobPostingDto[] = [];
  loading = true;

  get openJobs() { return this.jobs.filter(j => j.status === 'Open').length; }
  get totalApplicants() { return this.jobs.reduce((s, j) => s + j.applicationCount, 0); }

  constructor(private recruitment: RecruitmentService) {}
  ngOnInit() { this.recruitment.getJobPostings().subscribe({ next: j => { this.jobs = j; this.loading = false; }, error: () => this.loading = false }); }
  getSeverity(s: string) { return s === 'Open' ? 'success' : s === 'Closed' ? 'danger' : 'warn'; }
}
