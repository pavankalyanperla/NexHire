export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  userId: number;
}

export type UserRole = 'ManagementAdmin' | 'SeniorManager' | 'HRRecruiter' | 'Employee';
