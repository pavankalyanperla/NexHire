import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HrmsService } from '../../core/services/hrms.service';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { OnboardingRecordDto } from '../../core/models/hrms.model';
import { environment } from '../../../environments/environment';

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

  creatingAccount: { [id: number]: boolean } = {};
  accountCreated: { [id: number]: boolean } = {};
  toastMsg = '';
  toastSeverity: 'success' | 'warn' | 'error' = 'success';
  showToastFlag = false;

  showEditDialog = false;
  editRecord: OnboardingRecordDto | null = null;
  editForm: any = {};
  editLoading = false;

  offerStatuses = ['Pending', 'Sent', 'Accepted', 'Rejected'];
  overallStatuses = ['InProgress', 'Completed'];

  constructor(
    private hrms: HrmsService,
    private recruitment: RecruitmentService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRecords();
  }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.loadRecords(); }, 100);
  }

  load() { this.loadRecords(); }

  loadRecords() {
    this.loading = true;
    this.hrms.getAllOnboarding().subscribe({
      next: r => {
        this.records = r;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
        this.loadHiredCandidates();
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
            const allHired = all.filter((a: any) => a.status === 'Hired');
            // Exclude candidates who already have an onboarding record
            const onboardedEmails = new Set(
              this.records
                .map((o: any) => (o.candidateEmail || '').toLowerCase())
                .filter(Boolean)
            );
            this.hiredCandidates = allHired.filter(
              (a: any) => !onboardedEmails.has((a.candidateEmail || '').toLowerCase())
            );
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
        this.loadRecords();
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

  createEmployeeAccount(record: any) {
    if (!record.candidateEmail && !record.employeeName) {
      this.showToast('No candidate information found on this record.', 'error');
      return;
    }

    this.creatingAccount[record.id] = true;

    const accountPayload = {
      fullName:      record.candidateName  || record.employeeName,
      personalEmail: record.candidateEmail || '',
      department:    record.department     || 'General',
      designation:   record.designation   || 'Employee'
    };

    // Step 1 — create login account in IdentityService
    this.http.post<any>(`${environment.apiUrl}/auth/create-employee-account`, accountPayload).subscribe({
      next: (accountResponse: any) => {

        // Step 2 — create employee record in HRMSService
        const employeePayload = {
          userId:      accountResponse.userId,
          fullName:    accountResponse.fullName,
          email:       accountResponse.email,
          department:  accountPayload.department,
          designation: accountPayload.designation,
          role:        'Employee',
          joiningDate: record.joiningDate || new Date().toISOString()
        };

        this.http.post<any>(`${environment.apiUrl}/employees/create-from-hire`, employeePayload).subscribe({
          next: () => {
            this.accountCreated[record.id]  = true;
            this.creatingAccount[record.id] = false;
            this.showToast(
              `Account created! Login: ${accountResponse.email} — Credentials sent to ${accountPayload.personalEmail || 'employee'}`,
              'success'
            );
            this.cdr.detectChanges();
          },
          error: () => {
            this.accountCreated[record.id]  = true;
            this.creatingAccount[record.id] = false;
            this.showToast(
              `Account created (${accountResponse.email}) — employee profile setup pending. Ask admin to check HRMSService.`,
              'warn'
            );
            this.cdr.detectChanges();
          }
        });
      },
      error: err => {
        this.creatingAccount[record.id] = false;
        this.showToast(err.error?.message || 'Failed to create account.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  showToast(msg: string, severity: 'success' | 'warn' | 'error') {
    this.toastMsg      = msg;
    this.toastSeverity = severity;
    this.showToastFlag = true;
    setTimeout(() => { this.showToastFlag = false; this.cdr.detectChanges(); }, 4000);
    this.cdr.detectChanges();
  }
}
