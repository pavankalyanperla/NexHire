namespace HRMSService.Application.DTOs;

public class LeaveRequestDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? ApprovedByUserId { get; set; }
    public DateTime AppliedAt { get; set; }
}

public class CreateLeaveRequestDto
{
    public int EmployeeId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

public class UpdateLeaveStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int ApprovedByUserId { get; set; }
}
