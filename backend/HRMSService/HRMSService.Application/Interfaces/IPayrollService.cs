using HRMSService.Application.DTOs;

namespace HRMSService.Application.Interfaces;

public interface IPayrollService
{
    Task<PayrollRecordDto> GeneratePayrollAsync(GeneratePayrollDto dto);
    Task<IEnumerable<PayrollRecordDto>> GenerateBulkPayrollAsync(int month, int year);
    Task<PayrollRecordDto?> GetPayslipAsync(int employeeId, int month, int year);
    Task<IEnumerable<PayrollRecordDto>> GetPayrollByMonthAsync(int month, int year);
}
