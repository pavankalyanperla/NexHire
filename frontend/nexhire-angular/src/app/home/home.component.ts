import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false
})
export class HomeComponent {
  features = [
    { icon: 'pi-file-check', title: 'AI Resume Screening', desc: 'Screen resumes automatically with Gemini AI — match score, skills gap, recommendations.' },
    { icon: 'pi-chart-bar', title: 'Smart Analytics', desc: 'Real-time workforce insights: attendance, payroll, performance — all in one dashboard.' },
    { icon: 'pi-microphone', title: 'Voice Assistant', desc: 'Ask HR questions by voice. Get instant answers on leaves, policies, and salary.' },
    { icon: 'pi-building', title: 'End-to-End HRMS', desc: 'Onboarding, attendance, payroll, performance reviews — your complete HR suite.' }
  ];

  constructor(private router: Router) {}

  goToLogin() { this.router.navigate(['/login']); }
  goToCareers() { this.router.navigate(['/careers']); }
}
