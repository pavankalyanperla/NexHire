using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Services;

public class AttendanceService : IAttendanceService
{
    private readonly HRMSDbContext _ctx;
    public AttendanceService(HRMSDbContext ctx) => _ctx = ctx;

    public async Task<AttendanceDto> CheckInAsync(int employeeId)
    {
        var today = DateTime.UtcNow.Date;
        var existing = await _ctx.AttendanceRecords
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today);

        if (existing is not null)
            throw new InvalidOperationException("Already checked in for today.");

        var record = new AttendanceRecord
        {
            EmployeeId  = employeeId,
            Date        = today,
            CheckInTime = DateTime.UtcNow.TimeOfDay,
            Status      = "Present"
        };
        _ctx.AttendanceRecords.Add(record);
        await _ctx.SaveChangesAsync();
        return await ToDto(record);
    }

    public async Task<AttendanceDto> CheckOutAsync(int employeeId)
    {
        var today = DateTime.UtcNow.Date;
        var record = await _ctx.AttendanceRecords
            .Include(a => a.Employee)
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId && a.Date == today)
            ?? throw new InvalidOperationException("No check-in found for today.");

        var checkOut = DateTime.UtcNow.TimeOfDay;
        record.CheckOutTime  = checkOut;
        record.WorkingHours  = (checkOut - record.CheckInTime!.Value).TotalHours;
        await _ctx.SaveChangesAsync();
        return await ToDto(record);
    }

    public async Task<IEnumerable<AttendanceDto>> GetTodayAttendanceAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _ctx.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.Date == today)
            .Select(a => MapDto(a))
            .ToListAsync();
    }

    public async Task<IEnumerable<AttendanceDto>> GetEmployeeAttendanceAsync(int employeeId, int month, int year)
    {
        return await _ctx.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.EmployeeId == employeeId && a.Date.Month == month && a.Date.Year == year)
            .Select(a => MapDto(a))
            .ToListAsync();
    }

    public async Task<IEnumerable<AttendanceSummaryDto>> GetMonthlyAttendanceSummaryAsync(int month, int year)
    {
        var records = await _ctx.AttendanceRecords
            .Include(a => a.Employee)
            .Where(a => a.Date.Month == month && a.Date.Year == year)
            .ToListAsync();

        return records
            .GroupBy(a => a.Employee)
            .Select(g => new AttendanceSummaryDto
            {
                EmployeeId   = g.Key.Id,
                EmployeeName = g.Key.FullName,
                EmployeeCode = g.Key.EmployeeCode,
                PresentDays  = g.Count(a => a.Status == "Present"),
                AbsentDays   = g.Count(a => a.Status == "Absent"),
                LeaveDays    = g.Count(a => a.Status == "Leave"),
                HalfDays     = g.Count(a => a.Status == "HalfDay"),
                TotalHours   = g.Sum(a => a.WorkingHours ?? 0)
            });
    }

    private async Task<AttendanceDto> ToDto(AttendanceRecord r)
    {
        if (r.Employee is null)
            await _ctx.Entry(r).Reference(x => x.Employee).LoadAsync();
        return MapDto(r);
    }

    private static AttendanceDto MapDto(AttendanceRecord a) => new()
    {
        Id           = a.Id,
        EmployeeId   = a.EmployeeId,
        EmployeeName = a.Employee?.FullName ?? "",
        EmployeeCode = a.Employee?.EmployeeCode ?? "",
        Department   = a.Employee?.Department ?? "",
        Date         = a.Date,
        CheckInTime  = a.CheckInTime,
        CheckOutTime = a.CheckOutTime,
        Status       = a.Status,
        WorkingHours = a.WorkingHours
    };
}
