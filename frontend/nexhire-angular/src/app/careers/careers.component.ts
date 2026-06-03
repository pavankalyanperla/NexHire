import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { JobPostingDto } from '../core/models/recruitment.model';

@Component({
  selector: 'app-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss'],
  standalone: false
})
export class CareersComponent implements OnInit, AfterViewInit {
  jobs: JobPostingDto[] = [];
  loading = true;
  dataLoaded = false;

  // Apply dialog
  showApply = false;
  selectedJob: JobPostingDto | null = null;
  applying = false;
  success = false;
  errorMsg = '';

  form = { fullName: '', email: '', phone: '' };
  resumeFile: File | null = null;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.http.get<JobPostingDto[]>(`${environment.apiUrl}/jobpostings`).subscribe({
      next: jobs => {
        this.jobs = jobs.filter(j => j.status === 'Open');
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openApply(job: JobPostingDto) {
    this.selectedJob = job;
    this.form = { fullName: '', email: '', phone: '' };
    this.resumeFile = null;
    this.success = false;
    this.errorMsg = '';
    this.showApply = true;
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.resumeFile = input.files[0];
  }

  submit() {
    if (!this.selectedJob || !this.form.fullName || !this.form.email || !this.resumeFile) {
      this.errorMsg = 'Please fill all fields and upload your resume (PDF).';
      return;
    }

    this.applying = true;
    this.errorMsg = '';

    const fd = new FormData();
    fd.append('jobPostingId', String(this.selectedJob.id));
    fd.append('candidateName', this.form.fullName);
    fd.append('candidateEmail', this.form.email);
    fd.append('phone', this.form.phone);
    fd.append('resume', this.resumeFile, this.resumeFile.name);

    this.http.post(`${environment.apiUrl}/candidates/apply`, fd).subscribe({
      next: () => {
        this.success = true;
        this.applying = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.errorMsg = e.error?.message || 'Submission failed. Please try again.';
        this.applying = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatSalary(min: number, max: number): string {
    const fmt = (n: number) => n >= 100000 ? '₹' + (n / 100000).toFixed(0) + 'L' : '₹' + (n / 1000).toFixed(0) + 'K';
    return `${fmt(min)} – ${fmt(max)}`;
  }

  goHome() { this.router.navigate(['/']); }
}
