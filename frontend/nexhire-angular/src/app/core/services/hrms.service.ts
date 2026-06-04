import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EmployeeDto, CreateEmployeeDto, UpdateEmployeeDto, DepartmentSummary,
  AttendanceDto, AttendanceSummaryDto,
  LeaveRequestDto, CreateLeaveDto, UpdateLeaveStatusDto,
  PayrollRecordDto,
  PerformanceReviewDto, CreateReviewDto, UpdateManagerReviewDto,
  CompanyOverviewDto, HrOverviewDto, ManagerOverviewDto, EmployeeOverviewDto,
  RecruitmentStatsDto, OnboardingRecordDto
} from '../models/hrms.model';

@Injectable({ providedIn: 'root' })
export class HrmsService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Employees
  getEmployees(): Observable<EmployeeDto[]> {
    return this.http.get<EmployeeDto[]>(`${this.api}/employees`);
  }
  getEmployeeById(id: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.api}/employees/${id}`);
  }
  getEmployeeByUserId(userId: number): Observable<EmployeeDto> {
    return this.http.get<EmployeeDto>(`${this.api}/employees/user/${userId}`);
  }
  getDepartmentSummary(): Observable<DepartmentSummary[]> {
    return this.http.get<DepartmentSummary[]>(`${this.api}/employees/departments/summary`);
  }
  createEmployee(dto: CreateEmployeeDto): Observable<EmployeeDto> {
    return this.http.post<EmployeeDto>(`${this.api}/employees`, dto);
  }
  updateEmployee(id: number, dto: UpdateEmployeeDto): Observable<EmployeeDto> {
    return this.http.put<EmployeeDto>(`${this.api}/employees/${id}`, dto);
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/employees/${id}`);
  }

  // Attendance
  checkIn(employeeId: number): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.api}/attendance/checkin`, { employeeId });
  }
  checkOut(employeeId: number): Observable<AttendanceDto> {
    return this.http.post<AttendanceDto>(`${this.api}/attendance/checkout`, { employeeId });
  }
  getTodayAttendance(): Observable<AttendanceDto[]> {
    return this.http.get<AttendanceDto[]>(`${this.api}/attendance/today`);
  }
  getEmployeeAttendance(id: number, month: number, year: number): Observable<AttendanceDto[]> {
    return this.http.get<AttendanceDto[]>(`${this.api}/attendance/employee/${id}/${month}/${year}`);
  }
  getMonthlySummary(month: number, year: number): Observable<AttendanceSummaryDto[]> {
    return this.http.get<AttendanceSummaryDto[]>(`${this.api}/attendance/summary/${month}/${year}`);
  }

  // Leaves
  applyLeave(dto: CreateLeaveDto): Observable<LeaveRequestDto> {
    return this.http.post<LeaveRequestDto>(`${this.api}/leaves`, dto);
  }
  getMyLeaves(employeeId: number): Observable<LeaveRequestDto[]> {
    return this.http.get<LeaveRequestDto[]>(`${this.api}/leaves/employee/${employeeId}`);
  }
  getPendingLeaves(): Observable<LeaveRequestDto[]> {
    return this.http.get<LeaveRequestDto[]>(`${this.api}/leaves/pending`);
  }
  updateLeaveStatus(id: number, dto: UpdateLeaveStatusDto): Observable<LeaveRequestDto> {
    return this.http.put<LeaveRequestDto>(`${this.api}/leaves/${id}/status`, dto);
  }

  // Payroll
  generateBulkPayroll(month: number, year: number): Observable<PayrollRecordDto[]> {
    return this.http.post<PayrollRecordDto[]>(`${this.api}/payroll/generate-bulk?month=${month}&year=${year}`, {});
  }
  getPayslip(employeeId: number, month: number, year: number): Observable<PayrollRecordDto> {
    return this.http.get<PayrollRecordDto>(`${this.api}/payroll/payslip/${employeeId}/${month}/${year}`);
  }
  getMonthPayroll(month: number, year: number): Observable<PayrollRecordDto[]> {
    return this.http.get<PayrollRecordDto[]>(`${this.api}/payroll/month/${month}/${year}`);
  }

  // Performance
  createReview(dto: CreateReviewDto): Observable<PerformanceReviewDto> {
    return this.http.post<PerformanceReviewDto>(`${this.api}/performance`, dto);
  }
  getMyReviews(employeeId: number): Observable<PerformanceReviewDto[]> {
    return this.http.get<PerformanceReviewDto[]>(`${this.api}/performance/employee/${employeeId}`);
  }
  getPendingReviews(): Observable<PerformanceReviewDto[]> {
    return this.http.get<PerformanceReviewDto[]>(`${this.api}/performance/pending`);
  }
  updateManagerReview(id: number, dto: UpdateManagerReviewDto): Observable<PerformanceReviewDto> {
    return this.http.put<PerformanceReviewDto>(`${this.api}/performance/${id}/manager-review`, dto);
  }

  // Analytics
  getCompanyOverview(): Observable<CompanyOverviewDto> {
    return this.http.get<CompanyOverviewDto>(`${this.api}/analytics/company-overview`);
  }
  getHrOverview(): Observable<HrOverviewDto> {
    return this.http.get<HrOverviewDto>(`${this.api}/analytics/hr-overview`);
  }
  getManagerOverview(managerUserId: number): Observable<ManagerOverviewDto> {
    return this.http.get<ManagerOverviewDto>(`${this.api}/analytics/manager-overview/${managerUserId}`);
  }
  getEmployeeOverview(employeeId: number): Observable<EmployeeOverviewDto> {
    return this.http.get<EmployeeOverviewDto>(`${this.api}/analytics/employee-overview/${employeeId}`);
  }
  getRecruitmentStats(): Observable<RecruitmentStatsDto> {
    return this.http.get<RecruitmentStatsDto>(`${this.api}/analytics/recruitment-stats`);
  }

  // Onboarding
  getAllOnboarding(): Observable<OnboardingRecordDto[]> {
    return this.http.get<OnboardingRecordDto[]>(`${this.api}/onboarding`);
  }
  getOnboardingByEmployee(employeeId: number): Observable<OnboardingRecordDto> {
    return this.http.get<OnboardingRecordDto>(`${this.api}/onboarding/${employeeId}`);
  }
  createOnboarding(dto: { employeeId?: number; candidateName: string; candidateEmail: string; joiningDate: string | null; notes: string }): Observable<OnboardingRecordDto> {
    return this.http.post<OnboardingRecordDto>(`${this.api}/onboarding`, dto);
  }
  updateOnboarding(id: number, dto: any): Observable<OnboardingRecordDto> {
    return this.http.put<OnboardingRecordDto>(`${this.api}/onboarding/${id}`, dto);
  }
  updateOfferStatus(id: number, offerLetterStatus: string): Observable<OnboardingRecordDto> {
    return this.http.put<OnboardingRecordDto>(`${this.api}/onboarding/${id}/offer-status`, { offerLetterStatus });
  }
}
