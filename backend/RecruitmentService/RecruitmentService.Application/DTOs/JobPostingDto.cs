namespace RecruitmentService.Application.DTOs;

public class JobPostingDto
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
    public string Status { get; set; } = string.Empty;
    public int PostedByUserId { get; set; }
    public DateTime PostedAt { get; set; }
    public DateTime Deadline { get; set; }
    public int ApplicationCount { get; set; }
}

public class CreateJobPostingDto
{
    public string Title { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequiredSkills { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = string.Empty;
    public string JobType { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal SalaryMin { get; set; }
    public decimal SalaryMax { get; set; }
    public DateTime Deadline { get; set; }
    public int PostedByUserId { get; set; }
}

public class UpdateJobPostingDto
{
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
}
