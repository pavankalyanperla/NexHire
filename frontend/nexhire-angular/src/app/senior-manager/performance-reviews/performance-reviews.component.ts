import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HrmsService } from '../../core/services/hrms.service';
import { PerformanceReviewDto, UpdateManagerReviewDto } from '../../core/models/hrms.model';

@Component({ selector: 'app-performance-reviews', templateUrl: './performance-reviews.component.html', standalone: false })
export class PerformanceReviewsComponent implements OnInit, AfterViewInit {
  reviews: PerformanceReviewDto[] = [];
  loading = true;
  showDialog = false;
  selected: PerformanceReviewDto | null = null;
  managerRating = 3;
  managerComments = '';
  dataLoaded = false;

  constructor(private hrms: HrmsService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.load(); }

  ngAfterViewInit() {
    setTimeout(() => { if (!this.dataLoaded) this.load(); }, 100);
  }

  load() {
    this.loading = true;
    this.hrms.getPendingReviews().subscribe({
      next: r => {
        this.reviews = r;
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }

  openReview(r: PerformanceReviewDto) { this.selected = r; this.managerRating = 3; this.managerComments = ''; this.showDialog = true; }

  submit() {
    if (!this.selected) return;
    const dto: UpdateManagerReviewDto = { managerRating: this.managerRating, managerComments: this.managerComments, status: 'Reviewed' };
    this.hrms.updateManagerReview(this.selected.id, dto).subscribe(() => {
      this.showDialog = false;
      this.dataLoaded = false;
      this.load();
    });
  }
}
