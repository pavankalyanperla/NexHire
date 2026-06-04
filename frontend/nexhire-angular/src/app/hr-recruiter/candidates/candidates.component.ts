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

  // Interview Questions dialog
  showQDialog = false;
  questions: any = null;
  qLoading = false;

  // Candidate pipeline sidebar
  selectedCandidate: any = null;
  showCandidatePanel = false;
  answerInputs: { question: string; answer: string }[] = [];
  evaluationResult: any = null;
  showEvaluationResult = false;

  statusOptions = [
    { label: 'Applied',     value: 'Applied' },
    { label: 'Screening',   value: 'Screening' },
    { label: 'Shortlisted', value: 'Shortlisted' },
    { label: 'Rejected',    value: 'Rejected' },
    { label: 'Hired',       value: 'Hired' }
  ];

  constructor(
    private route: ActivatedRoute,
    private recruitment: RecruitmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.recruitment.getJobPostingById(this.jobId).subscribe(j => {
      this.job = j;
      this.cdr.detectChanges();
    });
    this.loadCandidates();
  }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.loadCandidates(); }, 100);
  }

  loadCandidates(afterLoad?: () => void) {
    this.loading = true;
    this.recruitment.getApplicationsByJob(this.jobId).subscribe({
      next: c => {
        this.candidates = c;
        this.loading = false;
        this.dataLoaded = true;
        if (afterLoad) afterLoad();
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
        this.dataLoaded = false;
        this.loadCandidates(() => this.refreshPanelIfOpen(applicationId));
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Screening error:', err);
        this.screenLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateQuestions(applicationId: number) {
    this.qLoading = true;
    if (!this.showCandidatePanel) {
      this.showQDialog = true;
    }
    this.questions = null;
    this.cdr.detectChanges();

    this.recruitment.generateInterviewQuestions(applicationId).subscribe({
      next: result => {
        this.questions = result;
        this.qLoading = false;
        this.dataLoaded = false;
        this.loadCandidates(() => this.refreshPanelIfOpen(applicationId));
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Questions error:', err);
        this.qLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(id: number, status: string) {
    this.recruitment.updateApplicationStatus(id, status).subscribe(() => {
      this.dataLoaded = false;
      this.loadCandidates(() => this.refreshPanelIfOpen(id));
    });
  }

  openCandidatePanel(candidate: any) {
    this.selectedCandidate = candidate;
    this.showCandidatePanel = true;
    this.evaluationResult = null;
    this.showEvaluationResult = false;
    this.buildAnswerInputs(candidate);
    this.cdr.detectChanges();
  }

  buildAnswerInputs(candidate: any) {
    this.answerInputs = [];
    if (!candidate.interviewQuestions) return;
    try {
      const parsed = JSON.parse(candidate.interviewQuestions);
      const all = [
        ...(parsed.technical_questions || []),
        ...(parsed.hr_questions || []),
        ...(parsed.scenario_questions || [])
      ];
      this.answerInputs = all.map((q: any) => ({ question: q.question, answer: '' }));
    } catch { this.answerInputs = []; }
  }

  refreshPanelIfOpen(applicationId: number) {
    if (!this.showCandidatePanel || !this.selectedCandidate) return;
    if (this.selectedCandidate.id !== applicationId) return;
    const updated = this.candidates.find(c => c.id === applicationId);
    if (updated) {
      this.selectedCandidate = updated;
      this.buildAnswerInputs(updated);
      this.cdr.detectChanges();
    }
  }

  submitAnswersForEvaluation() {
    if (!this.selectedCandidate || this.answerInputs.length === 0) return;
    const payload = {
      job_title: this.job?.title || '',
      questions_and_answers: this.answerInputs.filter(a => a.answer.trim())
    };
    this.recruitment.evaluateAnswers(this.selectedCandidate.id, payload).subscribe({
      next: result => {
        this.evaluationResult = result;
        this.showEvaluationResult = true;
        this.dataLoaded = false;
        const id = this.selectedCandidate.id;
        this.loadCandidates(() => this.refreshPanelIfOpen(id));
        this.cdr.detectChanges();
      },
      error: err => console.error('Evaluation error:', err)
    });
  }

  getResumeUrl(filePath: string): string {
    if (!filePath) return '';
    const filename = filePath.split('\\').pop() || filePath.split('/').pop() || '';
    return `http://localhost:5300/Uploads/Resumes/${encodeURIComponent(filename)}`;
  }

  viewResume(candidate: any) {
    if (!candidate.resumeFilePath) return;
    window.open(this.getResumeUrl(candidate.resumeFilePath), '_blank');
  }

  scoreSeverity(score: number | null): 'success' | 'warn' | 'danger' | 'secondary' {
    if (score === null) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warn';
    return 'danger';
  }

  getQList(obj: any, key: string): any[] { return obj?.[key] || []; }
}
