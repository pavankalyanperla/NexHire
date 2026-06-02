namespace HRMSService.Application.DTOs;

public class PerformanceReviewDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int ReviewerUserId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int SelfRating { get; set; }
    public int ManagerRating { get; set; }
    public string SelfComments { get; set; } = string.Empty;
    public string ManagerComments { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class CreateReviewDto
{
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public int SelfRating { get; set; }
    public string SelfComments { get; set; } = string.Empty;
    public string Goals { get; set; } = string.Empty;
}

public class UpdateManagerReviewDto
{
    public int ManagerRating { get; set; }
    public string ManagerComments { get; set; } = string.Empty;
    public string Status { get; set; } = "Reviewed";
}
