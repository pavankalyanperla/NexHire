import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { CandidateApplicationDto, JobPostingDto, AIScreeningResultDto } from '../../core/models/recruitment.model';

@Component({ selector: 'app-candidates', templateUrl: './candidates.component.html', standalone: false })
export class CandidatesComponent implements OnInit, AfterViewInit {
  jobId = 0;
  job: JobPostingDto | null = null;
  candidates: CandidateApplicationDto[] = [];
  loading = false;
  rankLoading = false;
  dataLoaded = false;

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

  constructor(private route: ActivatedRoute, private recruitment: RecruitmentService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.recruitment.getJobPostingById(this.jobId).subscribe(j => { this.job = j; this.cdr.detectChanges(); });
    this.loadCandidates();
  }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.loadCandidates(); }, 100);
  }

  loadCandidates() {
    this.loading = true;
    this.recruitment.getApplicationsByJob(this.jobId).subscribe({
      next: c => {
        this.candidates = c;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  rankAll() {
    this.rankLoading = true;
    this.recruitment.rankAllCandidates(this.jobId).subscribe({
      next: c => { this.candidates = c; this.rankLoading = false; this.cdr.detectChanges(); },
      error: () => { this.rankLoading = false; this.cdr.detectChanges(); }
    });
  }

  screen(id: number) {
    this.screeningCandidateId = id;
    this.screenLoading = true;
    this.showScreenDialog = true;
    this.screenResult = null;
    this.recruitment.screenResume(id).subscribe({
      next: r => { this.screenResult = r; this.screenLoading = false; this.cdr.detectChanges(); },
      error: () => { this.screenLoading = false; this.cdr.detectChanges(); }
    });
  }

  generateQuestions(id: number) {
    this.qLoading = true;
    this.showQDialog = true;
    this.questions = null;
    this.recruitment.generateInterviewQuestions(id).subscribe({
      next: q => { this.questions = q; this.qLoading = false; this.cdr.detectChanges(); },
      error: () => { this.qLoading = false; this.cdr.detectChanges(); }
    });
  }

  updateStatus(id: number, status: string) {
    this.recruitment.updateApplicationStatus(id, status).subscribe(() => { this.dataLoaded = false; this.loadCandidates(); });
  }

  scoreSeverity(score: number | null): 'success' | 'warn' | 'danger' | 'secondary' {
    if (score === null) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }

  getQList(obj: any, key: string): any[] { return obj?.[key] || []; }
}
