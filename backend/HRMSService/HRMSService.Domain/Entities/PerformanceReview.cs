namespace HRMSService.Domain.Entities;

public class PerformanceReview
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int ReviewerUserId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int SelfRating { get; set; }
    public int ManagerRating { get; set; }
    public string SelfComments { get; set; } = string.Empty;
    public string ManagerComments { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public Employee Employee { get; set; } = null!;
}
