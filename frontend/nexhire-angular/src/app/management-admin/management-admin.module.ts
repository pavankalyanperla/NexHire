import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { ManagementAdminComponent } from './dashboard/management-admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PayrollManagementComponent } from './payroll-management/payroll-management.component';
import { RecruitmentOverviewComponent } from './recruitment-overview/recruitment-overview.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [{
  path: '',
  component: ManagementAdminComponent,
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'employees', component: EmployeeListComponent },
    { path: 'payroll', component: PayrollManagementComponent },
    { path: 'recruitment', component: RecruitmentOverviewComponent },
    { path: 'reports', component: ReportsComponent }
  ]
}];

@NgModule({
  declarations: [ManagementAdminComponent, AdminDashboardComponent, EmployeeListComponent,
    PayrollManagementComponent, RecruitmentOverviewComponent, ReportsComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ManagementAdminModule {}
