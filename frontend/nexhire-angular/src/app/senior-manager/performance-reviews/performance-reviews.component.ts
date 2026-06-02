import { Component, OnInit } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { PerformanceReviewDto, UpdateManagerReviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-performance-reviews', templateUrl: './performance-reviews.component.html', standalone: false })
export class PerformanceReviewsComponent implements OnInit {
  reviews: PerformanceReviewDto[] = [];
  loading = true;
  showDialog = false;
  selected: PerformanceReviewDto | null = null;
  managerRating = 3;
  managerComments = '';

  constructor(private hrms: HrmsService) {}
  ngOnInit() { this.load(); }
  load() { this.hrms.getPendingReviews().subscribe({ next: r => { this.reviews = r; this.loading = false; }, error: () => this.loading = false }); }

  openReview(r: PerformanceReviewDto) { this.selected = r; this.managerRating = 3; this.managerComments = ''; this.showDialog = true; }

  submit() {
    if (!this.selected) return;
    const dto: UpdateManagerReviewDto = { managerRating: this.managerRating, managerComments: this.managerComments, status: 'Reviewed' };
    this.hrms.updateManagerReview(this.selected.id, dto).subscribe(() => { this.showDialog = false; this.load(); });
  }
}
