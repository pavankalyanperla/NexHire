import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { PerformanceReviewDto, CreateReviewDto, EmployeeDto } from '../../core/models/hrms.model';
import { environment } from '../../../environments/environment';

@Component({ selector: 'app-my-performance', templateUrl: './my-performance.component.html', standalone: false })
export class MyPerformanceComponent implements OnInit, AfterViewInit {
  reviews: PerformanceReviewDto[] = [];
  employeeInfo: EmployeeDto | null = null;
  employeeId = 0;
  loading = true;
  showDialog = false;
  selfRating = 3;
  selfComments = '';
  goals = '';
  dataLoaded = false;
  now = new Date();

  // AI Insights
  showInsights = false;
  aiInsights: any = null;
  insightsLoading = false;
  selectedReview: PerformanceReviewDto | null = null;

  constructor(
    private hrms: HrmsService,
    private auth: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.initLoad(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.initLoad(); }, 100);
  }

  initLoad() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe({
      next: emp => {
        this.employeeId = emp.id;
        this.employeeInfo = emp;
        this.load();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  load() {
    this.hrms.getMyReviews(this.employeeId).subscribe({
      next: r => {
        this.reviews = r;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openSelfReview() { this.selfRating = 3; this.selfComments = ''; this.goals = ''; this.showDialog = true; }

  submit() {
    const dto: CreateReviewDto = {
      employeeId: this.employeeId,
      month: this.now.getMonth() + 1,
      year: this.now.getFullYear(),
      selfRating: this.selfRating,
      selfComments: this.selfComments,
      goals: this.goals
    };
    this.hrms.createReview(dto).subscribe({
      next: () => { this.showDialog = false; this.dataLoaded = false; this.load(); },
      error: e => alert(e.error?.message || 'Error submitting review')
    });
  }

  monthName(m: number) { return new Date(2000, m-1).toLocaleString('default', { month: 'long' }); }

  getAIInsights(review: PerformanceReviewDto) {
    this.selectedReview = review;
    this.insightsLoading = true;
    this.showInsights = true;
    this.aiInsights = null;
    this.cdr.detectChanges();

    const user = this.auth.getCurrentUser();
    const payload = {
      employee_name: this.employeeInfo?.fullName || user?.fullName || 'Employee',
      department:    this.employeeInfo?.department || user?.department || 'Engineering',
      designation:   this.employeeInfo?.designation || 'Employee',
      self_rating:   review.selfRating,
      manager_rating: review.managerRating,
      self_comments:  review.selfComments || 'Good performance',
      manager_comments: review.managerComments || 'Satisfactory',
      goals:          review.goals || 'Improve skills',
      month:          review.month,
      year:           review.year
    };

    this.http.post(`${environment.apiUrl}/ai/performance-insights/${this.employeeId}`, payload).subscribe({
      next: (response: any) => {
        this.aiInsights = response;
        this.insightsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('AI insights error:', err);
        this.insightsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getList(obj: any, key: string): string[] { return obj?.[key] || []; }

  levelSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' {
    if (level === 'Excellent') return 'success';
    if (level === 'Good') return 'info';
    if (level === 'Satisfactory') return 'warn';
    return 'danger';
  }
}
