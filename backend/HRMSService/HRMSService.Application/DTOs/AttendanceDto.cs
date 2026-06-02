namespace HRMSService.Application.DTOs;

public class AttendanceDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? CheckInTime { get; set; }
    public TimeSpan? CheckOutTime { get; set; }
    public string Status { get; set; } = string.Empty;
    public double? WorkingHours { get; set; }
}

public class CheckInDto
{
    public int EmployeeId { get; set; }
}

public class CheckOutDto
{
    public int EmployeeId { get; set; }
}

public class AttendanceSummaryDto
{
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public int PresentDays { get; set; }
    public int AbsentDays { get; set; }
    public int LeaveDays { get; set; }
    public int HalfDays { get; set; }
    public double TotalHours { get; set; }
}
