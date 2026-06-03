import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'careers',
    loadChildren: () => import('./careers/careers.module').then(m => m.CareersModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./management-admin/management-admin.module').then(m => m.ManagementAdminModule),
    canActivate: [AuthGuard],
    data: { role: 'ManagementAdmin' }
  },
  {
    path: 'manager',
    loadChildren: () => import('./senior-manager/senior-manager.module').then(m => m.SeniorManagerModule),
    canActivate: [AuthGuard],
    data: { role: 'SeniorManager' }
  },
  {
    path: 'hr',
    loadChildren: () => import('./hr-recruiter/hr-recruiter.module').then(m => m.HRRecruiterModule),
    canActivate: [AuthGuard],
    data: { role: 'HRRecruiter' }
  },
  {
    path: 'employee',
    loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule),
    canActivate: [AuthGuard],
    data: { role: 'Employee' }
  },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
