using IdentityService.Application.DTOs;

namespace IdentityService.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<CreateEmployeeAccountResponseDto> CreateEmployeeAccountAsync(CreateEmployeeAccountDto dto);
    Task<CreateEmployeeAccountResponseDto> CreateStaffAccountAsync(CreateStaffAccountDto dto);
}
