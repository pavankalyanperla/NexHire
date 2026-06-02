using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Services;

public class PerformanceService : IPerformanceService
{
    private readonly HRMSDbContext _ctx;
    public PerformanceService(HRMSDbContext ctx) => _ctx = ctx;

    public async Task<PerformanceReviewDto> CreateReviewAsync(CreateReviewDto dto)
    {
        var exists = await _ctx.PerformanceReviews.AnyAsync(r =>
            r.EmployeeId == dto.EmployeeId && r.Month == dto.Month && r.Year == dto.Year);
        if (exists)
            throw new InvalidOperationException("Review already exists for this employee/month/year.");

        var review = new PerformanceReview
        {
            EmployeeId    = dto.EmployeeId,
            ReviewerUserId = 0,
            Month         = dto.Month,
            Year          = dto.Year,
            SelfRating    = dto.SelfRating,
            SelfComments  = dto.SelfComments,
            Goals         = dto.Goals,
            Status        = "Pending"
        };
        _ctx.PerformanceReviews.Add(review);
        await _ctx.SaveChangesAsync();
        await _ctx.Entry(review).Reference(r => r.Employee).LoadAsync();
        return MapDto(review);
    }

    public async Task<IEnumerable<PerformanceReviewDto>> GetReviewsByEmployeeAsync(int employeeId) =>
        await _ctx.PerformanceReviews
            .Include(r => r.Employee)
            .Where(r => r.EmployeeId == employeeId)
            .Select(r => MapDto(r))
            .ToListAsync();

    public async Task<IEnumerable<PerformanceReviewDto>> GetPendingReviewsAsync() =>
        await _ctx.PerformanceReviews
            .Include(r => r.Employee)
            .Where(r => r.Status == "Pending")
            .Select(r => MapDto(r))
            .ToListAsync();

    public async Task<PerformanceReviewDto> UpdateManagerReviewAsync(int id, UpdateManagerReviewDto dto)
    {
        var review = await _ctx.PerformanceReviews
            .Include(r => r.Employee)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new InvalidOperationException($"Review {id} not found.");

        review.ManagerRating   = dto.ManagerRating;
        review.ManagerComments = dto.ManagerComments;
        review.Status          = dto.Status;
        await _ctx.SaveChangesAsync();
        return MapDto(review);
    }

    private static PerformanceReviewDto MapDto(PerformanceReview r) => new()
    {
        Id             = r.Id,
        EmployeeId     = r.EmployeeId,
        EmployeeName   = r.Employee?.FullName ?? "",
        Department     = r.Employee?.Department ?? "",
        ReviewerUserId = r.ReviewerUserId,
        Month          = r.Month,
        Year           = r.Year,
        SelfRating     = r.SelfRating,
        ManagerRating  = r.ManagerRating,
        SelfComments   = r.SelfComments,
        ManagerComments= r.ManagerComments,
        Goals          = r.Goals,
        Status         = r.Status
    };
}
