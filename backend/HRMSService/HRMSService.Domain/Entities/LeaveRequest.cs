namespace HRMSService.Domain.Entities;

public class LeaveRequest
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime FromDate { get; set; }
    public DateTime ToDate { get; set; }
    public string LeaveType { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public int? ApprovedByUserId { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public Employee Employee { get; set; } = null!;
}
