using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Services;

public class LeaveService : ILeaveService
{
    private readonly HRMSDbContext _ctx;
    public LeaveService(HRMSDbContext ctx) => _ctx = ctx;

    public async Task<LeaveRequestDto> ApplyLeaveAsync(CreateLeaveRequestDto dto)
    {
        var leave = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            FromDate   = dto.FromDate,
            ToDate     = dto.ToDate,
            LeaveType  = dto.LeaveType,
            Reason     = dto.Reason,
            Status     = "Pending",
            AppliedAt  = DateTime.UtcNow
        };
        _ctx.LeaveRequests.Add(leave);
        await _ctx.SaveChangesAsync();
        await _ctx.Entry(leave).Reference(l => l.Employee).LoadAsync();
        return MapDto(leave);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetLeavesByEmployeeAsync(int employeeId) =>
        await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .Where(l => l.EmployeeId == employeeId)
            .Select(l => MapDto(l))
            .ToListAsync();

    public async Task<IEnumerable<LeaveRequestDto>> GetPendingLeavesAsync() =>
        await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .Where(l => l.Status == "Pending")
            .Select(l => MapDto(l))
            .ToListAsync();

    public async Task<LeaveRequestDto> UpdateLeaveStatusAsync(int id, UpdateLeaveStatusDto dto)
    {
        var leave = await _ctx.LeaveRequests
            .Include(l => l.Employee)
            .FirstOrDefaultAsync(l => l.Id == id)
            ?? throw new InvalidOperationException($"Leave request {id} not found.");

        leave.Status           = dto.Status;
        leave.ApprovedByUserId = dto.ApprovedByUserId;
        await _ctx.SaveChangesAsync();
        return MapDto(leave);
    }

    private static LeaveRequestDto MapDto(LeaveRequest l) => new()
    {
        Id                = l.Id,
        EmployeeId        = l.EmployeeId,
        EmployeeName      = l.Employee?.FullName ?? "",
        Department        = l.Employee?.Department ?? "",
        FromDate          = l.FromDate,
        ToDate            = l.ToDate,
        LeaveType         = l.LeaveType,
        Reason            = l.Reason,
        Status            = l.Status,
        ApprovedByUserId  = l.ApprovedByUserId,
        AppliedAt         = l.AppliedAt
    };
}
