import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { SeniorManagerComponent } from './dashboard/senior-manager.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { LeaveApprovalsComponent } from './leave-approvals/leave-approvals.component';
import { PerformanceReviewsComponent } from './performance-reviews/performance-reviews.component';

const routes: Routes = [{
  path: '',
  component: SeniorManagerComponent,
  children: [
    { path: '', component: ManagerDashboardComponent },
    { path: 'leaves', component: LeaveApprovalsComponent },
    { path: 'performance', component: PerformanceReviewsComponent }
  ]
}];

@NgModule({
  declarations: [SeniorManagerComponent, ManagerDashboardComponent, LeaveApprovalsComponent, PerformanceReviewsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class SeniorManagerModule {}
