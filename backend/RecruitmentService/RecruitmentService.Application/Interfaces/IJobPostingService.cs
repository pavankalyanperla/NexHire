using RecruitmentService.Application.DTOs;

namespace RecruitmentService.Application.Interfaces;

public interface IJobPostingService
{
    Task<IEnumerable<JobPostingDto>> GetAllJobPostingsAsync();
    Task<JobPostingDto?> GetJobPostingByIdAsync(int id);
    Task<JobPostingDto> CreateJobPostingAsync(CreateJobPostingDto dto);
    Task<JobPostingDto> UpdateJobPostingAsync(int id, UpdateJobPostingDto dto);
    Task DeleteJobPostingAsync(int id);
}
