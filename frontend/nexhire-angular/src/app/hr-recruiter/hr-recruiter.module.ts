import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { HRRecruiterComponent } from './dashboard/hr-recruiter.component';
import { HRDashboardComponent } from './hr-dashboard/hr-dashboard.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { AttendanceOverviewComponent } from './attendance-overview/attendance-overview.component';

const routes: Routes = [{
  path: '',
  component: HRRecruiterComponent,
  children: [
    { path: '', component: HRDashboardComponent },
    { path: 'employees', component: EmployeeManagementComponent },
    { path: 'attendance', component: AttendanceOverviewComponent }
  ]
}];

@NgModule({
  declarations: [HRRecruiterComponent, HRDashboardComponent, EmployeeManagementComponent, AttendanceOverviewComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class HRRecruiterModule {}
