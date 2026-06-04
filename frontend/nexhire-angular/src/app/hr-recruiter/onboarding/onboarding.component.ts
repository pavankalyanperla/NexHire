import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { HrmsService } from '../../core/services/hrms.service';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { OnboardingRecordDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-onboarding', templateUrl: './onboarding.component.html', standalone: false })
export class OnboardingComponent implements OnInit, AfterViewInit {
  records: OnboardingRecordDto[] = [];
  hiredCandidates: any[] = [];
  loading = true;
  dataLoaded = false;

  showCreateDialog = false;
  createForm = { candidateName: '', candidateEmail: '', joiningDate: '', notes: '' };
  selectedHiredCandidate: any = null;
  createLoading = false;

  showEditDialog = false;
  editRecord: OnboardingRecordDto | null = null;
  editForm: any = {};
  editLoading = false;

  offerStatuses = ['Pending', 'Sent', 'Accepted', 'Rejected'];
  overallStatuses = ['InProgress', 'Completed'];

  constructor(
    private hrms: HrmsService,
    private recruitment: RecruitmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.loadHiredCandidates();
  }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.hrms.getAllOnboarding().subscribe({
      next: r => {
        this.records = r;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadHiredCandidates() {
    this.recruitment.getJobPostings().subscribe({
      next: jobs => {
        if (jobs.length === 0) { this.hiredCandidates = []; this.cdr.detectChanges(); return; }
        const requests = jobs.map(job => this.recruitment.getApplicationsByJob(job.id));
        forkJoin(requests).subscribe({
          next: results => {
            const all = (results as any[][]).flat();
            this.hiredCandidates = all.filter((a: any) => a.status === 'Hired');
            this.cdr.detectChanges();
          },
          error: () => { this.hiredCandidates = []; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.hiredCandidates = []; }
    });
  }

  openCreate() {
    this.createForm = { candidateName: '', candidateEmail: '', joiningDate: '', notes: '' };
    this.selectedHiredCandidate = null;
    this.showCreateDialog = true;
  }

  onCandidateSelect(candidate: any) {
    if (candidate) {
      this.selectedHiredCandidate    = candidate;
      this.createForm.candidateName  = candidate.candidateName;
      this.createForm.candidateEmail = candidate.candidateEmail;
    }
  }

  create() {
    if (!this.createForm.candidateName) return;
    this.createLoading = true;
    this.hrms.createOnboarding({
      candidateName:  this.createForm.candidateName,
      candidateEmail: this.createForm.candidateEmail,
      joiningDate:    this.createForm.joiningDate || null,
      notes:          this.createForm.notes
    }).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.createLoading = false;
        this.dataLoaded = false;
        this.load();
      },
      error: e => { alert(e.error?.message || 'Error creating onboarding record'); this.createLoading = false; }
    });
  }

  openEdit(rec: OnboardingRecordDto) {
    this.editRecord = rec;
    this.editForm = {
      offerLetterStatus:             rec.offerLetterStatus,
      idProofSubmitted:              rec.idProofSubmitted,
      aadharSubmitted:               rec.aadharSubmitted,
      panCardSubmitted:              rec.panCardSubmitted,
      bankDetailsSubmitted:          rec.bankDetailsSubmitted,
      educationCertificatesSubmitted: rec.educationCertificatesSubmitted,
      laptopAssigned:                rec.laptopAssigned,
      emailAccountCreated:           rec.emailAccountCreated,
      accessCardIssued:              rec.accessCardIssued,
      notes:                         rec.notes,
      status:                        rec.status,
      joiningDate:                   rec.joiningDate ? rec.joiningDate.slice(0, 10) : ''
    };
    this.showEditDialog = true;
  }

  save() {
    if (!this.editRecord) return;
    this.editLoading = true;
    const dto = { ...this.editForm, joiningDate: this.editForm.joiningDate || null };
    this.hrms.updateOnboarding(this.editRecord.id, dto).subscribe({
      next: updated => {
        const idx = this.records.findIndex(r => r.id === this.editRecord!.id);
        if (idx >= 0) this.records[idx] = updated;
        this.showEditDialog = false;
        this.editLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.editLoading = false; this.cdr.detectChanges(); }
    });
  }

  docsPct(rec: OnboardingRecordDto): number { return Math.round((rec.docsCount / 5) * 100); }
  itPct(rec: OnboardingRecordDto): number { return Math.round((rec.itCount / 3) * 100); }

  offerSeverity(s: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (s === 'Accepted') return 'success';
    if (s === 'Sent') return 'warn';
    if (s === 'Rejected') return 'danger';
    return 'secondary';
  }

  statusSeverity(s: string): 'success' | 'warn' {
    return s === 'Completed' ? 'success' : 'warn';
  }
}
