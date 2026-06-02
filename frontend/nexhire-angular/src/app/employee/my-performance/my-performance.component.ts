import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { AuthService } from '../../core/services/auth.service';
import { PerformanceReviewDto, CreateReviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-my-performance', templateUrl: './my-performance.component.html', standalone: false })
export class MyPerformanceComponent implements OnInit {
  reviews: PerformanceReviewDto[] = [];
  employeeId = 0;
  loading = true;
  showDialog = false;
  selfRating = 3;
  selfComments = '';
  goals = '';
  now = new Date();

  constructor(private hrms: HrmsService, private auth: AuthService) {}
  ngOnInit() {
    const userId = this.auth.getCurrentUser()?.userId;
    if (!userId) { this.loading = false; return; }
    this.hrms.getEmployeeByUserId(userId).subscribe(emp => { this.employeeId = emp.id; this.load(); });
  }
  load() { this.hrms.getMyReviews(this.employeeId).subscribe({ next: r => { this.reviews = r; this.loading = false; }, error: () => this.loading = false }); }
  openSelfReview() { this.selfRating = 3; this.selfComments = ''; this.goals = ''; this.showDialog = true; }
  submit() {
    const dto: CreateReviewDto = { employeeId: this.employeeId, month: this.now.getMonth() + 1, year: this.now.getFullYear(), selfRating: this.selfRating, selfComments: this.selfComments, goals: this.goals };
    this.hrms.createReview(dto).subscribe({ next: () => { this.showDialog = false; this.load(); }, error: e => alert(e.error?.message || 'Error') });
  }
  monthName(m: number) { return new Date(2000, m-1).toLocaleString('default', { month: 'long' }); }
}
