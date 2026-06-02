using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Services;

public class PayrollService : IPayrollService
{
    private readonly HRMSDbContext _ctx;
    public PayrollService(HRMSDbContext ctx) => _ctx = ctx;

    public async Task<PayrollRecordDto> GeneratePayrollAsync(GeneratePayrollDto dto)
    {
        var emp = await _ctx.Employees.FindAsync(dto.EmployeeId)
                  ?? throw new InvalidOperationException($"Employee {dto.EmployeeId} not found.");

        var existing = await _ctx.PayrollRecords
            .FirstOrDefaultAsync(p => p.EmployeeId == dto.EmployeeId && p.Month == dto.Month && p.Year == dto.Year);

        if (existing is not null)
            return MapDto(existing, emp);

        var record = Calculate(emp, dto.Month, dto.Year);
        _ctx.PayrollRecords.Add(record);
        await _ctx.SaveChangesAsync();
        return MapDto(record, emp);
    }

    public async Task<IEnumerable<PayrollRecordDto>> GenerateBulkPayrollAsync(int month, int year)
    {
        var employees = await _ctx.Employees.Where(e => e.Status == "Active").ToListAsync();
        var results = new List<PayrollRecordDto>();
        foreach (var emp in employees)
        {
            var existing = await _ctx.PayrollRecords
                .FirstOrDefaultAsync(p => p.EmployeeId == emp.Id && p.Month == month && p.Year == year);
            if (existing is null)
            {
                var record = Calculate(emp, month, year);
                _ctx.PayrollRecords.Add(record);
                await _ctx.SaveChangesAsync();
                results.Add(MapDto(record, emp));
            }
            else
            {
                results.Add(MapDto(existing, emp));
            }
        }
        return results;
    }

    public async Task<PayrollRecordDto?> GetPayslipAsync(int employeeId, int month, int year)
    {
        var r = await _ctx.PayrollRecords
            .Include(p => p.Employee)
            .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.Month == month && p.Year == year);
        return r is null ? null : MapDto(r, r.Employee);
    }

    public async Task<IEnumerable<PayrollRecordDto>> GetPayrollByMonthAsync(int month, int year) =>
        await _ctx.PayrollRecords
            .Include(p => p.Employee)
            .Where(p => p.Month == month && p.Year == year)
            .Select(p => MapDto(p, p.Employee))
            .ToListAsync();

    private static PayrollRecord Calculate(Employee emp, int month, int year)
    {
        var hra   = Math.Round(emp.BaseSalary * 0.40m, 2);
        var ta    = Math.Round(emp.BaseSalary * 0.10m, 2);
        var gross = emp.BaseSalary + hra + ta;
        var pf    = Math.Round(emp.BaseSalary * 0.12m, 2);
        var tax   = Math.Round(gross * 0.10m, 2);
        return new PayrollRecord
        {
            EmployeeId   = emp.Id,
            Month        = month,
            Year         = year,
            BaseSalary   = emp.BaseSalary,
            HRA          = hra,
            TA           = ta,
            GrossSalary  = Math.Round(gross, 2),
            PF           = pf,
            Tax          = tax,
            NetSalary    = Math.Round(gross - pf - tax, 2),
            Status       = "Generated",
            GeneratedAt  = DateTime.UtcNow
        };
    }

    private static PayrollRecordDto MapDto(PayrollRecord r, Employee? emp) => new()
    {
        Id           = r.Id,
        EmployeeId   = r.EmployeeId,
        EmployeeName = emp?.FullName ?? "",
        EmployeeCode = emp?.EmployeeCode ?? "",
        Department   = emp?.Department ?? "",
        Month        = r.Month,
        Year         = r.Year,
        BaseSalary   = r.BaseSalary,
        HRA          = r.HRA,
        TA           = r.TA,
        GrossSalary  = r.GrossSalary,
        PF           = r.PF,
        Tax          = r.Tax,
        NetSalary    = r.NetSalary,
        Status       = r.Status,
        GeneratedAt  = r.GeneratedAt
    };
}
