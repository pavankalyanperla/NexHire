namespace RecruitmentService.Domain.Entities;

public class JobPosting
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal SalaryMin { get; set; }
    public decimal SalaryMax { get; set; }
    public string Status { get; set; } = "Open";
    public int PostedByUserId { get; set; }
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public DateTime Deadline { get; set; }
    public ICollection<CandidateApplication> Applications { get; set; } = new List<CandidateApplication>();
}
