import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { OnboardingRecordDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-onboarding', templateUrl: './my-onboarding.component.html', standalone: false })
export class MyOnboardingComponent implements OnInit, AfterViewInit {
  record: OnboardingRecordDto | null = null;
  loading = true;
  notFound = false;
  dataLoaded = false;

  constructor(private hrms: HrmsService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.loading = true;
    this.hrms.getEmployeeByUserId(userId).subscribe({
      next: emp => {
        this.hrms.getOnboardingByEmployee(emp.id).subscribe({
          next: r => {
            this.record = r;
            this.loading = false;
            this.dataLoaded = true;
            this.cdr.detectChanges();
          },
          error: (e) => {
            this.notFound = e.status === 404;
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  totalItems = 8;

  completedItems(r: OnboardingRecordDto): number {
    return r.docsCount + r.itCount;
  }

  completionPct(r: OnboardingRecordDto): number {
    return Math.round((this.completedItems(r) / this.totalItems) * 100);
  }

  offerSeverity(s: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (s === 'Accepted') return 'success';
    if (s === 'Sent') return 'warn';
    if (s === 'Rejected') return 'danger';
    return 'secondary';
  }

  checkItems(r: OnboardingRecordDto) {
    return [
      { label: 'ID Proof', done: r.idProofSubmitted },
      { label: 'Aadhar Card', done: r.aadharSubmitted },
      { label: 'PAN Card', done: r.panCardSubmitted },
      { label: 'Bank Details', done: r.bankDetailsSubmitted },
      { label: 'Education Certificates', done: r.educationCertificatesSubmitted },
      { label: 'Laptop Assigned', done: r.laptopAssigned },
      { label: 'Email Account', done: r.emailAccountCreated },
      { label: 'Access Card', done: r.accessCardIssued }
    ];
  }
}
