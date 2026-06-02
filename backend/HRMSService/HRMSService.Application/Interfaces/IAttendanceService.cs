using HRMSService.Application.DTOs;

namespace HRMSService.Application.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceDto> CheckInAsync(int employeeId);
    Task<AttendanceDto> CheckOutAsync(int employeeId);
    Task<IEnumerable<AttendanceDto>> GetTodayAttendanceAsync();
    Task<IEnumerable<AttendanceDto>> GetEmployeeAttendanceAsync(int employeeId, int month, int year);
    Task<IEnumerable<AttendanceSummaryDto>> GetMonthlyAttendanceSummaryAsync(int month, int year);
}
