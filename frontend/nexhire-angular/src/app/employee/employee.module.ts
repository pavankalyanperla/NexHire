import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { EmployeeComponent } from './dashboard/employee.component';

const routes: Routes = [
  { path: '', component: EmployeeComponent }
];

@NgModule({
  declarations: [EmployeeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ButtonModule, AvatarModule]
})
export class EmployeeModule {}
