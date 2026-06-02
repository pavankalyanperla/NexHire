import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SeniorManagerComponent } from './dashboard/senior-manager.component';

const routes: Routes = [
  { path: '', component: SeniorManagerComponent }
];

@NgModule({
  declarations: [SeniorManagerComponent],
  imports: [CommonModule, RouterModule.forChild(routes), ButtonModule, AvatarModule]
})
export class SeniorManagerModule {}
