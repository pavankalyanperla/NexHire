import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { CandidateApplicationDto, JobPostingDto, AIScreeningResultDto } from '../../core/models/recruitment.model';

@Component({ selector: 'app-candidates', templateUrl: './candidates.component.html', standalone: false })
export class CandidatesComponent implements OnInit {
  jobId = 0;
  job: JobPostingDto | null = null;
  candidates: CandidateApplicationDto[] = [];
  loading = false;
  rankLoading = false;

  // AI Screening dialog
  showScreenDialog = false;
  screenResult: AIScreeningResultDto | null = null;
  screenLoading = false;
  screeningCandidateId = 0;

  // Interview Questions dialog
  showQDialog = false;
  questions: any = null;
  qLoading = false;

  statuses = ['Applied', 'Screening', 'Shortlisted', 'Rejected', 'Hired'];

  constructor(private route: ActivatedRoute, private recruitment: RecruitmentService) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.recruitment.getJobPostingById(this.jobId).subscribe(j => this.job = j);
    this.loadCandidates();
  }

  loadCandidates() {
    this.loading = true;
    this.recruitment.getApplicationsByJob(this.jobId).subscribe({ next: c => { this.candidates = c; this.loading = false; }, error: () => this.loading = false });
  }

  rankAll() {
    this.rankLoading = true;
    this.recruitment.rankAllCandidates(this.jobId).subscribe({
      next: c => { this.candidates = c; this.rankLoading = false; },
      error: () => this.rankLoading = false
    });
  }

  screen(id: number) {
    this.screeningCandidateId = id;
    this.screenLoading = true;
    this.showScreenDialog = true;
    this.screenResult = null;
    this.recruitment.screenResume(id).subscribe({
      next: r => { this.screenResult = r; this.screenLoading = false; },
      error: () => { this.screenLoading = false; }
    });
  }

  generateQuestions(id: number) {
    this.qLoading = true;
    this.showQDialog = true;
    this.questions = null;
    this.recruitment.generateInterviewQuestions(id).subscribe({
      next: q => { this.questions = q; this.qLoading = false; },
      error: () => this.qLoading = false
    });
  }

  updateStatus(id: number, status: string) {
    this.recruitment.updateApplicationStatus(id, status).subscribe(() => this.loadCandidates());
  }

  scoreSeverity(score: number | null): 'success' | 'warn' | 'danger' | 'secondary' {
    if (score === null) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }

  getQList(obj: any, key: string): any[] {
    return obj?.[key] || [];
  }
}
