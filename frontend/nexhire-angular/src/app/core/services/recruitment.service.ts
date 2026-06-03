import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobPostingDto, CreateJobPostingDto, CandidateApplicationDto, AIScreeningResultDto, ChatbotResponse, ChatbotRequest } from '../models/recruitment.model';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Job Postings
  getJobPostings(): Observable<JobPostingDto[]> {
    return this.http.get<JobPostingDto[]>(`${this.api}/jobpostings`);
  }
  getJobPostingById(id: number): Observable<JobPostingDto> {
    return this.http.get<JobPostingDto>(`${this.api}/jobpostings/${id}`);
  }
  createJobPosting(dto: CreateJobPostingDto): Observable<JobPostingDto> {
    return this.http.post<JobPostingDto>(`${this.api}/jobpostings`, dto);
  }
  updateJobPosting(id: number, dto: Partial<JobPostingDto>): Observable<JobPostingDto> {
    return this.http.put<JobPostingDto>(`${this.api}/jobpostings/${id}`, dto);
  }

  // Candidates
  getApplicationsByJob(jobId: number): Observable<CandidateApplicationDto[]> {
    return this.http.get<CandidateApplicationDto[]>(`${this.api}/candidates/job/${jobId}`);
  }
  getRankedCandidates(jobId: number): Observable<CandidateApplicationDto[]> {
    return this.http.get<CandidateApplicationDto[]>(`${this.api}/candidates/job/${jobId}/ranked`);
  }
  applyWithResume(formData: FormData): Observable<CandidateApplicationDto> {
    return this.http.post<CandidateApplicationDto>(`${this.api}/candidates/apply`, formData);
  }
  updateApplicationStatus(id: number, status: string): Observable<CandidateApplicationDto> {
    return this.http.put<CandidateApplicationDto>(`${this.api}/candidates/${id}/status`, { status });
  }

  // AI Operations (via gateway → RecruitmentService → Python AI)
  screenResume(applicationId: number): Observable<AIScreeningResultDto> {
    return this.http.post<AIScreeningResultDto>(`${this.api}/ai/screen/${applicationId}`, {});
  }
  rankAllCandidates(jobId: number): Observable<CandidateApplicationDto[]> {
    return this.http.post<CandidateApplicationDto[]>(`${this.api}/ai/rank/${jobId}`, {});
  }
  generateInterviewQuestions(applicationId: number): Observable<any> {
    return this.http.post<any>(`${this.api}/ai/questions/${applicationId}`, {});
  }
  evaluateAnswers(applicationId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.api}/ai/evaluate/${applicationId}`, payload);
  }
  getPerformanceInsights(employeeId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/ai/performance-insights/${employeeId}`, data);
  }

  // AI Chatbot — calls InterviewAI directly (not via gateway)
  askChatbot(req: ChatbotRequest): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>('http://localhost:8002/api/interview/chatbot', req);
  }
}
