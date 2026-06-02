namespace HRMSService.Domain.Entities;

public class Employee
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string Status { get; set; } = "Active";
    public decimal BaseSalary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
    public ICollection<PerformanceReview> PerformanceReviews { get; set; } = new List<PerformanceReview>();
}
