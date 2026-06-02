import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ManagementAdminComponent } from './dashboard/management-admin.component';

const routes: Routes = [
  { path: '', component: ManagementAdminComponent }
];

@NgModule({
  declarations: [ManagementAdminComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ButtonModule, AvatarModule]
})
export class ManagementAdminModule {}
