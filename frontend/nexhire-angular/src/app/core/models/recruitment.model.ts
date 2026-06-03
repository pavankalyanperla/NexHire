export interface JobPostingDto {
  id: number; title: string; department: string; description: string;
  requiredSkills: string; experienceLevel: string; jobType: string;
  location: string; salaryMin: number; salaryMax: number; status: string;
  postedByUserId: number; postedAt: string; deadline: string; applicationCount: number;
}
export interface CreateJobPostingDto {
  title: string; department: string; description: string; requiredSkills: string;
  experienceLevel: string; jobType: string; location: string;
  salaryMin: number; salaryMax: number; deadline: string; postedByUserId: number;
}

export interface CandidateApplicationDto {
  id: number; jobPostingId: number; jobTitle: string; candidateName: string;
  candidateEmail: string; phone: string; resumeFilePath: string; resumeText: string;
  status: string; aiMatchScore: number | null; aiAnalysis: string;
  interviewQuestions: string; answerEvaluation: string; appliedAt: string;
}

export interface AIScreeningResultDto {
  applicationId: number; candidateName: string; matchScore: number;
  recommendation: string; matchedSkills: string[]; missingSkills: string[];
  summary: string; rawAnalysis: string;
}

export interface ChatbotResponse { answer: string; category: string; }
export interface ChatbotRequest { question: string; employee_name: string; department: string; }
