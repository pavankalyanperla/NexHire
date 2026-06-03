using Microsoft.EntityFrameworkCore;
using RecruitmentService.Application.DTOs;
using RecruitmentService.Application.Interfaces;
using RecruitmentService.Domain.Entities;
using RecruitmentService.Infrastructure.Data;

namespace RecruitmentService.Infrastructure.Services;

public class JobPostingService : IJobPostingService
{
    private readonly RecruitmentDbContext _ctx;
    public JobPostingService(RecruitmentDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<JobPostingDto>> GetAllJobPostingsAsync() =>
        await _ctx.JobPostings
            .Select(j => ToDto(j, j.Applications.Count))
            .ToListAsync();

    public async Task<JobPostingDto?> GetJobPostingByIdAsync(int id)
    {
        var j = await _ctx.JobPostings.Include(x => x.Applications).FirstOrDefaultAsync(x => x.Id == id);
        return j is null ? null : ToDto(j, j.Applications.Count);
    }

    public async Task<JobPostingDto> CreateJobPostingAsync(CreateJobPostingDto dto)
    {
        var job = new JobPosting
        {
            Title          = dto.Title,
            Department     = dto.Department,
            Description    = dto.Description,
            RequiredSkills = dto.RequiredSkills,
            ExperienceLevel= dto.ExperienceLevel,
            JobType        = dto.JobType,
            Location       = dto.Location,
            SalaryMin      = dto.SalaryMin,
            SalaryMax      = dto.SalaryMax,
            Deadline       = dto.Deadline,
            PostedByUserId = dto.PostedByUserId,
            PostedAt       = DateTime.UtcNow,
            Status         = "Open"
        };
        _ctx.JobPostings.Add(job);
        await _ctx.SaveChangesAsync();
        return ToDto(job, 0);
    }

    public async Task<JobPostingDto> UpdateJobPostingAsync(int id, UpdateJobPostingDto dto)
    {
        var job = await _ctx.JobPostings.FindAsync(id)
                  ?? throw new InvalidOperationException($"Job posting {id} not found.");
        if (!string.IsNullOrEmpty(dto.Status))      job.Status = dto.Status;
        if (!string.IsNullOrEmpty(dto.Description)) job.Description = dto.Description;
        if (dto.Deadline != default)                 job.Deadline = dto.Deadline;
        await _ctx.SaveChangesAsync();
        return ToDto(job, 0);
    }

    public async Task DeleteJobPostingAsync(int id)
    {
        var job = await _ctx.JobPostings.FindAsync(id)
                  ?? throw new InvalidOperationException($"Job posting {id} not found.");
        _ctx.JobPostings.Remove(job);
        await _ctx.SaveChangesAsync();
    }

    private static JobPostingDto ToDto(JobPosting j, int appCount) => new()
    {
        Id = j.Id, Title = j.Title, Department = j.Department, Description = j.Description,
        RequiredSkills = j.RequiredSkills, ExperienceLevel = j.ExperienceLevel,
        JobType = j.JobType, Location = j.Location, SalaryMin = j.SalaryMin,
        SalaryMax = j.SalaryMax, Status = j.Status, PostedByUserId = j.PostedByUserId,
        PostedAt = j.PostedAt, Deadline = j.Deadline, ApplicationCount = appCount
    };
}
