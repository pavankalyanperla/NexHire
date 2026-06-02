import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { ManagementAdminComponent } from './dashboard/management-admin.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { PayrollManagementComponent } from './payroll-management/payroll-management.component';

const routes: Routes = [{
  path: '',
  component: ManagementAdminComponent,
  children: [
    { path: '', component: AdminDashboardComponent },
    { path: 'employees', component: EmployeeListComponent },
    { path: 'payroll', component: PayrollManagementComponent }
  ]
}];

@NgModule({
  declarations: [ManagementAdminComponent, AdminDashboardComponent, EmployeeListComponent, PayrollManagementComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ManagementAdminModule {}
