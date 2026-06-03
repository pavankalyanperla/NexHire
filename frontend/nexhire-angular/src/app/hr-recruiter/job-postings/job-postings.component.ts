import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { AuthService } from '../../core/services/auth.service';
import { JobPostingDto, CreateJobPostingDto } from '../../core/models/recruitment.model';

@Component({ selector: 'app-job-postings', templateUrl: './job-postings.component.html', standalone: false })
export class JobPostingsComponent implements OnInit {
  jobs: JobPostingDto[] = [];
  loading = true;
  showDialog = false;
  form: CreateJobPostingDto = this.emptyForm();
  expLevels = ['Junior', 'Mid', 'Senior'];
  jobTypes = ['Full-time', 'Part-time', 'Contract'];

  constructor(private recruitment: RecruitmentService, private auth: AuthService, private router: Router) {}

  ngOnInit() { this.load(); }
  load() { this.recruitment.getJobPostings().subscribe({ next: j => { this.jobs = j; this.loading = false; }, error: () => this.loading = false }); }

  createJob() {
    this.form.postedByUserId = this.auth.getCurrentUser()?.userId || 0;
    this.recruitment.createJobPosting(this.form).subscribe(() => { this.showDialog = false; this.load(); });
  }

  viewCandidates(jobId: number) { this.router.navigate(['/hr/jobs', jobId, 'candidates']); }
  getSeverity(s: string) { return s === 'Open' ? 'success' : s === 'Closed' ? 'danger' : 'warn'; }

  emptyForm(): CreateJobPostingDto {
    const d = new Date(); d.setMonth(d.getMonth() + 1);
    return { title: '', department: '', description: '', requiredSkills: '', experienceLevel: 'Mid', jobType: 'Full-time', location: 'Bangalore', salaryMin: 0, salaryMax: 0, deadline: d.toISOString().slice(0,10), postedByUserId: 0 };
  }
}
