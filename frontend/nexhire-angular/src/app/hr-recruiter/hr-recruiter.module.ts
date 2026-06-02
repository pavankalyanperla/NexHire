import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { HRRecruiterComponent } from './dashboard/hr-recruiter.component';

const routes: Routes = [
  { path: '', component: HRRecruiterComponent }
];

@NgModule({
  declarations: [HRRecruiterComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ButtonModule, AvatarModule]
})
export class HRRecruiterModule {}
