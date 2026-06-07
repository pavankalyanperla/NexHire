using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Services;

public class EmployeeService : IEmployeeService
{
    private readonly HRMSDbContext _ctx;
    public EmployeeService(HRMSDbContext ctx) => _ctx = ctx;

    public async Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync() =>
        await _ctx.Employees.Select(e => ToDto(e)).ToListAsync();

    public async Task<EmployeeDto?> GetEmployeeByIdAsync(int id)
    {
        var e = await _ctx.Employees.FindAsync(id);
        return e is null ? null : ToDto(e);
    }

    public async Task<EmployeeDto?> GetEmployeeByUserIdAsync(int userId)
    {
        if (userId <= 0) return null;

        var e = await _ctx.Employees
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.Id)
            .FirstOrDefaultAsync();

        if (e is null)
        {
            // Fallback: when a user has multiple Identity accounts (e.g. demo + staff account),
            // look up their full name from IdentityDB and find the employee by name.
            var names = await _ctx.Database
                .SqlQueryRaw<string>(
                    "SELECT FullName FROM NexHire_IdentityDB.dbo.Users WHERE Id = {0}", userId)
                .ToListAsync();
            var fullName = names.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(fullName))
                e = await _ctx.Employees
                    .Where(x => x.FullName == fullName)
                    .OrderByDescending(x => x.Id)
                    .FirstOrDefaultAsync();
        }

        return e is null ? null : ToDto(e);
    }

    public async Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto)
    {
        var emp = new Employee
        {
            UserId      = dto.UserId,
            FullName    = dto.FullName,
            Email       = dto.Email,
            Phone       = dto.Phone,
            Department  = dto.Department,
            Designation = dto.Designation,
            Role        = dto.Role,
            JoiningDate = dto.JoiningDate,
            BaseSalary  = dto.BaseSalary
        };
        _ctx.Employees.Add(emp);
        await _ctx.SaveChangesAsync();
        emp.EmployeeCode = $"NX-{emp.Id:000}";
        await _ctx.SaveChangesAsync();
        return ToDto(emp);
    }

    public async Task<EmployeeDto> CreateFromHireAsync(CreateFromHireDto dto)
    {
        var emp = new Employee
        {
            UserId      = dto.UserId,
            FullName    = dto.FullName,
            Email       = dto.Email,
            Phone       = string.Empty,
            Department  = dto.Department,
            Designation = dto.Designation,
            Role        = dto.Role,
            JoiningDate = dto.JoiningDate == default ? DateTime.UtcNow : dto.JoiningDate,
            BaseSalary  = 50000,
            Status      = "Active",
            CreatedAt   = DateTime.UtcNow
        };
        _ctx.Employees.Add(emp);
        await _ctx.SaveChangesAsync();
        emp.EmployeeCode = $"NX-{emp.Id:000}";
        await _ctx.SaveChangesAsync();
        return ToDto(emp);
    }

    public async Task<EmployeeDto> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
    {
        var emp = await _ctx.Employees.FindAsync(id)
                  ?? throw new InvalidOperationException($"Employee {id} not found.");
        emp.Phone       = dto.Phone;
        emp.Department  = dto.Department;
        emp.Designation = dto.Designation;
        emp.Status      = dto.Status;
        emp.BaseSalary  = dto.BaseSalary;
        if (dto.Email != null) emp.Email = dto.Email;
        await _ctx.SaveChangesAsync();
        return ToDto(emp);
    }

    public async Task DeleteEmployeeAsync(int id)
    {
        var emp = await _ctx.Employees.FindAsync(id)
                  ?? throw new InvalidOperationException($"Employee {id} not found.");
        _ctx.Employees.Remove(emp);
        await _ctx.SaveChangesAsync();
    }

    public async Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentSummaryAsync() =>
        await _ctx.Employees
            .GroupBy(e => e.Department)
            .Select(g => new DepartmentSummaryDto { Department = g.Key, Count = g.Count() })
            .ToListAsync();

    private static EmployeeDto ToDto(Employee e) => new()
    {
        Id          = e.Id,
        UserId      = e.UserId,
        FullName    = e.FullName,
        Email       = e.Email,
        Phone       = e.Phone,
        Department  = e.Department,
        Designation = e.Designation,
        Role        = e.Role,
        JoiningDate = e.JoiningDate,
        EmployeeCode= e.EmployeeCode,
        Status      = e.Status,
        BaseSalary  = e.BaseSalary,
        CreatedAt   = e.CreatedAt
    };
}
