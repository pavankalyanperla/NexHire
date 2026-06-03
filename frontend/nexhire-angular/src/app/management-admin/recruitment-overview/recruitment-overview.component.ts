import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { JobPostingDto } from '../../core/models/recruitment.model';

@Component({ selector: 'app-recruitment-overview', templateUrl: './recruitment-overview.component.html', standalone: false })
export class RecruitmentOverviewComponent implements OnInit, AfterViewInit {
  jobs: JobPostingDto[] = [];
  loading = true;
  dataLoaded = false;

  get openJobs() { return this.jobs.filter(j => j.status === 'Open').length; }
  get totalApplicants() { return this.jobs.reduce((s, j) => s + j.applicationCount, 0); }

  constructor(private recruitment: RecruitmentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.recruitment.getJobPostings().subscribe({
      next: j => {
        this.jobs = j;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  getSeverity(s: string) { return s === 'Open' ? 'success' : s === 'Closed' ? 'danger' : 'warn'; }
}
