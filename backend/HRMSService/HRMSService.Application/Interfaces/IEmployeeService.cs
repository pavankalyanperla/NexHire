using HRMSService.Application.DTOs;

namespace HRMSService.Application.Interfaces;

public interface IEmployeeService
{
    Task<IEnumerable<EmployeeDto>> GetAllEmployeesAsync();
    Task<EmployeeDto?> GetEmployeeByIdAsync(int id);
    Task<EmployeeDto?> GetEmployeeByUserIdAsync(int userId);
    Task<EmployeeDto> CreateEmployeeAsync(CreateEmployeeDto dto);
    Task<EmployeeDto> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto);
    Task DeleteEmployeeAsync(int id);
    Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentSummaryAsync();
}
