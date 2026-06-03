import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { EmployeeComponent } from './dashboard/employee.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { MyAttendanceComponent } from './my-attendance/my-attendance.component';
import { MyPayslipsComponent } from './my-payslips/my-payslips.component';
import { MyLeavesComponent } from './my-leaves/my-leaves.component';
import { MyPerformanceComponent } from './my-performance/my-performance.component';
import { AIChatbotComponent } from './ai-chatbot/ai-chatbot.component';

const routes: Routes = [{
  path: '',
  component: EmployeeComponent,
  children: [
    { path: '', component: EmployeeDashboardComponent },
    { path: 'attendance', component: MyAttendanceComponent },
    { path: 'payslips', component: MyPayslipsComponent },
    { path: 'leaves', component: MyLeavesComponent },
    { path: 'performance', component: MyPerformanceComponent }
  ]
}];

@NgModule({
  declarations: [EmployeeComponent, EmployeeDashboardComponent, MyAttendanceComponent,
    MyPayslipsComponent, MyLeavesComponent, MyPerformanceComponent, AIChatbotComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class EmployeeModule {}
