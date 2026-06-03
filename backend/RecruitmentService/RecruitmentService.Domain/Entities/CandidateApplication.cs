namespace RecruitmentService.Domain.Entities;

public class CandidateApplication
{
    public int Id { get; set; }
    public int JobPostingId { get; set; }
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string ResumeFilePath { get; set; } = string.Empty;
    public string ResumeText { get; set; } = string.Empty;
    public string Status { get; set; } = "Applied";
    public int? AIMatchScore { get; set; }
    public string AIAnalysis { get; set; } = string.Empty;
    public string InterviewQuestions { get; set; } = string.Empty;
    public string CandidateAnswers { get; set; } = string.Empty;
    public string AnswerEvaluation { get; set; } = string.Empty;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public JobPosting JobPosting { get; set; } = null!;
}
