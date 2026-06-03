namespace RecruitmentService.Application.DTOs;

public class CandidateApplicationDto
{
    public int Id { get; set; }
    public int JobPostingId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ResumeFilePath { get; set; } = string.Empty;
    public string ResumeText { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? AIMatchScore { get; set; }
    public string AIAnalysis { get; set; } = string.Empty;
    public string InterviewQuestions { get; set; } = string.Empty;
    public string AnswerEvaluation { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; }
}

public class CreateApplicationDto
{
    public int JobPostingId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class UpdateApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class AIScreeningResultDto
{
    public int ApplicationId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public int MatchScore { get; set; }
    public string Recommendation { get; set; } = string.Empty;
    public List<string> MatchedSkills { get; set; } = new();
    public List<string> MissingSkills { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
    public string RawAnalysis { get; set; } = string.Empty;
}
