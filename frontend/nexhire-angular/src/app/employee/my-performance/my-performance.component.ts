import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { RecruitmentService } from '../../core/services/recruitment.service';
import { PerformanceReviewDto, CreateReviewDto, EmployeeDto } from '../../core/models/hrms.model';

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
  insights: any = null;
  insightsLoading = false;
  selectedReview: PerformanceReviewDto | null = null;

  constructor(private hrms: HrmsService, private auth: AuthService, private recruitment: RecruitmentService, private cdr: ChangeDetectorRef) {}

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
    const dto: CreateReviewDto = { employeeId: this.employeeId, month: this.now.getMonth() + 1, year: this.now.getFullYear(), selfRating: this.selfRating, selfComments: this.selfComments, goals: this.goals };
    this.hrms.createReview(dto).subscribe({
      next: () => { this.showDialog = false; this.dataLoaded = false; this.load(); },
      error: e => alert(e.error?.message || 'Error')
    });
  }

  monthName(m: number) { return new Date(2000, m-1).toLocaleString('default', { month: 'long' }); }

  getAIInsights(review: PerformanceReviewDto) {
    this.selectedReview = review;
    this.insightsLoading = true;
    this.showInsights = true;
    this.insights = null;

    const payload = {
      employee_name: this.employeeInfo?.fullName || 'Employee',
      department: this.employeeInfo?.department || '',
      designation: this.employeeInfo?.designation || '',
      self_rating: review.selfRating,
      manager_rating: review.managerRating,
      self_comments: review.selfComments,
      manager_comments: review.managerComments,
      goals: review.goals,
      month: review.month,
      year: review.year
    };

    this.recruitment.getPerformanceInsights(this.employeeId, payload).subscribe({
      next: i => { this.insights = i; this.insightsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.insightsLoading = false; this.cdr.detectChanges(); }
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
