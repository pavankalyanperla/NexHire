namespace HRMSService.Domain.Entities;

public class AttendanceRecord
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan? CheckInTime { get; set; }
    public TimeSpan? CheckOutTime { get; set; }
    public string Status { get; set; } = "Present";
    public double? WorkingHours { get; set; }
    public Employee Employee { get; set; } = null!;
}
