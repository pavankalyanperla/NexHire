using Microsoft.EntityFrameworkCore;
using RecruitmentService.Application.DTOs;
using RecruitmentService.Application.Interfaces;
using RecruitmentService.Domain.Entities;
using RecruitmentService.Infrastructure.Data;

namespace RecruitmentService.Infrastructure.Services;

public class CandidateService : ICandidateService
{
    private readonly RecruitmentDbContext _ctx;
    public CandidateService(RecruitmentDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<CandidateApplicationDto>> GetApplicationsByJobAsync(int jobId) =>
        await _ctx.CandidateApplications
            .Include(c => c.JobPosting)
            .Where(c => c.JobPostingId == jobId)
            .Select(c => ToDto(c))
            .ToListAsync();

    public async Task<CandidateApplicationDto?> GetApplicationByIdAsync(int id)
    {
        var c = await _ctx.CandidateApplications.Include(x => x.JobPosting).FirstOrDefaultAsync(x => x.Id == id);
        return c is null ? null : ToDto(c);
    }

    public async Task<CandidateApplicationDto> CreateApplicationAsync(CreateApplicationDto dto, string resumeFilePath, string resumeText)
    {
        var app = new CandidateApplication
        {
            JobPostingId   = dto.JobPostingId,
            CandidateName  = dto.CandidateName,
            CandidateEmail = dto.CandidateEmail,
            Phone          = dto.Phone,
            ResumeFilePath = resumeFilePath,
            ResumeText     = resumeText,
            Status         = "Applied",
            AppliedAt      = DateTime.UtcNow
        };
        _ctx.CandidateApplications.Add(app);
        await _ctx.SaveChangesAsync();
        await _ctx.Entry(app).Reference(x => x.JobPosting).LoadAsync();
        return ToDto(app);
    }

    public async Task<CandidateApplicationDto> UpdateApplicationStatusAsync(int id, UpdateApplicationStatusDto dto)
    {
        var app = await _ctx.CandidateApplications.Include(c => c.JobPosting).FirstOrDefaultAsync(c => c.Id == id)
                  ?? throw new InvalidOperationException($"Application {id} not found.");
        app.Status = dto.Status;
        await _ctx.SaveChangesAsync();
        return ToDto(app);
    }

    public async Task SaveAIScreeningResultAsync(int applicationId, int score, string analysis)
    {
        var app = await _ctx.CandidateApplications.FindAsync(applicationId)
                  ?? throw new InvalidOperationException($"Application {applicationId} not found.");
        app.AIMatchScore = score;
        app.AIAnalysis   = analysis;
        if (score >= 70) app.Status = "Shortlisted";
        await _ctx.SaveChangesAsync();
    }

    public async Task SaveInterviewQuestionsAsync(int applicationId, string questionsJson)
    {
        var app = await _ctx.CandidateApplications.FindAsync(applicationId)
                  ?? throw new InvalidOperationException($"Application {applicationId} not found.");
        app.InterviewQuestions = questionsJson;
        await _ctx.SaveChangesAsync();
    }

    public async Task SaveAnswerEvaluationAsync(int applicationId, string evaluationJson)
    {
        var app = await _ctx.CandidateApplications.FindAsync(applicationId)
                  ?? throw new InvalidOperationException($"Application {applicationId} not found.");
        app.AnswerEvaluation = evaluationJson;
        await _ctx.SaveChangesAsync();
    }

    public async Task<IEnumerable<CandidateApplicationDto>> GetRankedCandidatesAsync(int jobId) =>
        await _ctx.CandidateApplications
            .Include(c => c.JobPosting)
            .Where(c => c.JobPostingId == jobId)
            .OrderByDescending(c => c.AIMatchScore)
            .Select(c => ToDto(c))
            .ToListAsync();

    private static CandidateApplicationDto ToDto(CandidateApplication c) => new()
    {
        Id = c.Id, JobPostingId = c.JobPostingId, JobTitle = c.JobPosting?.Title ?? "",
        CandidateName = c.CandidateName, CandidateEmail = c.CandidateEmail, Phone = c.Phone,
        ResumeFilePath = c.ResumeFilePath, ResumeText = c.ResumeText, Status = c.Status,
        AIMatchScore = c.AIMatchScore, AIAnalysis = c.AIAnalysis,
        InterviewQuestions = c.InterviewQuestions,
        AnswerEvaluation = c.AnswerEvaluation, AppliedAt = c.AppliedAt
    };
}
