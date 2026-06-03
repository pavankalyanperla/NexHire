import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { OnboardingRecordDto, EmployeeDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-onboarding', templateUrl: './onboarding.component.html', standalone: false })
export class OnboardingComponent implements OnInit, AfterViewInit {
  records: OnboardingRecordDto[] = [];
  employees: EmployeeDto[] = [];
  loading = true;
  dataLoaded = false;

  showCreateDialog = false;
  createForm = { employeeId: 0, joiningDate: '', notes: '' };
  createLoading = false;

  showEditDialog = false;
  editRecord: OnboardingRecordDto | null = null;
  editForm: any = {};
  editLoading = false;

  offerStatuses = ['Pending', 'Sent', 'Accepted', 'Rejected'];
  overallStatuses = ['InProgress', 'Completed'];

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
    this.hrms.getEmployees().subscribe(e => { this.employees = e; this.cdr.detectChanges(); });
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

  openCreate() {
    this.createForm = { employeeId: 0, joiningDate: '', notes: '' };
    this.showCreateDialog = true;
  }

  create() {
    if (!this.createForm.employeeId) return;
    this.createLoading = true;
    this.hrms.createOnboarding({
      employeeId: this.createForm.employeeId,
      joiningDate: this.createForm.joiningDate || null,
      notes: this.createForm.notes
    }).subscribe({
      next: () => {
        this.showCreateDialog = false;
        this.createLoading = false;
        this.dataLoaded = false;
        this.load();
      },
      error: (e) => { alert(e.error?.message || 'Error creating onboarding record'); this.createLoading = false; }
    });
  }

  openEdit(rec: OnboardingRecordDto) {
    this.editRecord = rec;
    this.editForm = {
      offerLetterStatus: rec.offerLetterStatus,
      idProofSubmitted: rec.idProofSubmitted,
      aadharSubmitted: rec.aadharSubmitted,
      panCardSubmitted: rec.panCardSubmitted,
      bankDetailsSubmitted: rec.bankDetailsSubmitted,
      educationCertificatesSubmitted: rec.educationCertificatesSubmitted,
      laptopAssigned: rec.laptopAssigned,
      emailAccountCreated: rec.emailAccountCreated,
      accessCardIssued: rec.accessCardIssued,
      notes: rec.notes,
      status: rec.status,
      joiningDate: rec.joiningDate ? rec.joiningDate.slice(0,10) : ''
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

  employeesWithoutOnboarding(): EmployeeDto[] {
    const existing = new Set(this.records.map(r => r.employeeId));
    return this.employees.filter(e => !existing.has(e.id));
  }
}
