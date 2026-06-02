using HRMSService.Application.DTOs;

namespace HRMSService.Application.Interfaces;

public interface ILeaveService
{
    Task<LeaveRequestDto> ApplyLeaveAsync(CreateLeaveRequestDto dto);
    Task<IEnumerable<LeaveRequestDto>> GetLeavesByEmployeeAsync(int employeeId);
    Task<IEnumerable<LeaveRequestDto>> GetPendingLeavesAsync();
    Task<LeaveRequestDto> UpdateLeaveStatusAsync(int id, UpdateLeaveStatusDto dto);
}
