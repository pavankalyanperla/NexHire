export interface EmployeeDto {
  id: number; userId: number; fullName: string; email: string; phone: string;
  department: string; designation: string; role: string; joiningDate: string;
  employeeCode: string; status: string; baseSalary: number; createdAt: string;
}
export interface CreateEmployeeDto {
  userId: number; fullName: string; email: string; phone: string;
  department: string; designation: string; role: string; joiningDate: string; baseSalary: number;
}
export interface UpdateEmployeeDto {
  phone: string; department: string; designation: string; status: string; baseSalary: number;
}
export interface DepartmentSummary { department: string; count: number; }

export interface AttendanceDto {
  id: number; employeeId: number; employeeName: string; employeeCode: string;
  department: string; date: string; checkInTime: string | null; checkOutTime: string | null;
  status: string; workingHours: number | null;
}
export interface AttendanceSummaryDto {
  employeeId: number; employeeName: string; employeeCode: string;
  presentDays: number; absentDays: number; leaveDays: number; halfDays: number; totalHours: number;
}

export interface LeaveRequestDto {
  id: number; employeeId: number; employeeName: string; department: string;
  fromDate: string; toDate: string; leaveType: string; reason: string;
  status: string; appliedAt: string;
}
export interface CreateLeaveDto {
  employeeId: number; fromDate: string; toDate: string; leaveType: string; reason: string;
}
export interface UpdateLeaveStatusDto { status: string; approvedByUserId: number; }

export interface PayrollRecordDto {
  id: number; employeeId: number; employeeName: string; employeeCode: string;
  department: string; month: number; year: number; baseSalary: number;
  hra: number; ta: number; pf: number; tax: number; grossSalary: number; netSalary: number;
  status: string; generatedAt: string;
}

export interface PerformanceReviewDto {
  id: number; employeeId: number; employeeName: string; department: string;
  reviewerUserId: number; month: number; year: number;
  selfRating: number; managerRating: number; selfComments: string;
  managerComments: string; goals: string; status: string;
}
export interface CreateReviewDto {
  employeeId: number; month: number; year: number;
  selfRating: number; selfComments: string; goals: string;
}
export interface UpdateManagerReviewDto { managerRating: number; managerComments: string; status: string; }
