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

  // AI Screening
  showScreenDialog = false;
  screenResult: AIScreeningResultDto | null = null;
  screenLoading = false;

  // Interview Questions
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
      next: c => {
        this.candidates = c;
        this.rankLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.rankLoading = false; this.cdr.detectChanges(); }
    });
  }

  screen(applicationId: number) {
    this.screenLoading = true;
    this.showScreenDialog = true;
    this.screenResult = null;
    this.cdr.detectChanges();

    this.recruitment.screenResume(applicationId).subscribe({
      next: result => {
        this.screenResult = result;
        this.screenLoading = false;
        // Reload to show updated AI score in table
        this.dataLoaded = false;
        this.loadCandidates();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Screening error:', err);
        this.screenLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateQuestions(applicationId: number) {
    this.qLoading = true;
    this.showQDialog = true;
    this.questions = null;
    this.cdr.detectChanges();

    this.recruitment.generateInterviewQuestions(applicationId).subscribe({
      next: result => {
        this.questions = result;
        this.qLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Questions error:', err);
        this.qLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: number, status: string) {
    this.recruitment.updateApplicationStatus(id, status).subscribe(() => {
      this.dataLoaded = false;
      this.loadCandidates();
    });
  }

  scoreSeverity(score: number | null): 'success' | 'warn' | 'danger' | 'secondary' {
    if (score === null) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }

  getQList(obj: any, key: string): any[] { return obj?.[key] || []; }
}
