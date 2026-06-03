import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-careers',
  standalone: false,
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss']
})
export class CareersComponent implements OnInit {
  jobs: any[] = [];
  isLoading = false;
  showApplyDialog = false;
  selectedJob: any = null;

  applicantName = '';
  applicantEmail = '';
  applicantPhone = '';
  selectedFile: File | null = null;
  submitting = false;
  submitSuccess = false;
  submitError = '';

  private directUrl  = 'http://localhost:5300/api';
  private gatewayUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadJobs(); }

  loadJobs() {
    this.isLoading = true;
    this.http.get<any[]>(`${this.directUrl}/jobpostings`).subscribe({
      next: data => {
        this.jobs = data.filter(j => j.status === 'Open');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        // Fallback to gateway
        this.http.get<any[]>(`${this.gatewayUrl}/jobpostings`).subscribe({
          next: data => {
            this.jobs = data.filter(j => j.status === 'Open');
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Failed to load jobs:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  openApplyDialog(job: any) {
    this.selectedJob = job;
    this.showApplyDialog = true;
    this.submitSuccess = false;
    this.submitError = '';
    this.applicantName = '';
    this.applicantEmail = '';
    this.applicantPhone = '';
    this.selectedFile = null;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.submitError = '';
    } else {
      this.submitError = 'Please select a PDF file only.';
    }
  }

  submitApplication() {
    if (!this.applicantName || !this.applicantEmail || !this.applicantPhone || !this.selectedFile) {
      this.submitError = 'Please fill all fields and upload your resume.';
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const fd = new FormData();
    fd.append('JobPostingId', this.selectedJob.id.toString());
    fd.append('CandidateName', this.applicantName);
    fd.append('CandidateEmail', this.applicantEmail);
    fd.append('Phone', this.applicantPhone);
    fd.append('resume', this.selectedFile);

    this.http.post(`${this.directUrl}/candidates/apply`, fd).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Apply error:', err);
        this.submitError = err.error?.message || 'Failed to submit application. Please try again.';
        this.submitting = false;
        this.cdr.detectChanges();
      }
    });
  }
}
