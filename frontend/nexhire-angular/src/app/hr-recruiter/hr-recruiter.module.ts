import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

import { HRRecruiterComponent } from './dashboard/hr-recruiter.component';
import { HRDashboardComponent } from './hr-dashboard/hr-dashboard.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { AttendanceOverviewComponent } from './attendance-overview/attendance-overview.component';
import { JobPostingsComponent } from './job-postings/job-postings.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

const routes: Routes = [{
  path: '',
  component: HRRecruiterComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: HRDashboardComponent },
    { path: 'employees', component: EmployeeManagementComponent },
    { path: 'attendance', component: AttendanceOverviewComponent },
    { path: 'jobs', component: JobPostingsComponent },
    { path: 'jobs/:jobId/candidates', component: CandidatesComponent },
    { path: 'onboarding', component: OnboardingComponent }
  ]
}];

@NgModule({
  declarations: [HRRecruiterComponent, HRDashboardComponent, EmployeeManagementComponent,
    AttendanceOverviewComponent, JobPostingsComponent, CandidatesComponent, OnboardingComponent],
  imports: [SharedModule, TooltipModule, CheckboxModule, RouterModule.forChild(routes)]
})
export class HRRecruiterModule {}
