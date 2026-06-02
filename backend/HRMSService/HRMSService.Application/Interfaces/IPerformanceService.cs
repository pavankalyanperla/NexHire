using HRMSService.Application.DTOs;

namespace HRMSService.Application.Interfaces;

public interface IPerformanceService
{
    Task<PerformanceReviewDto> CreateReviewAsync(CreateReviewDto dto);
    Task<IEnumerable<PerformanceReviewDto>> GetReviewsByEmployeeAsync(int employeeId);
    Task<IEnumerable<PerformanceReviewDto>> GetPendingReviewsAsync();
    Task<PerformanceReviewDto> UpdateManagerReviewAsync(int id, UpdateManagerReviewDto dto);
}
