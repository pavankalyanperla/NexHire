using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using IdentityService.Infrastructure.Data;
using IdentityService.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IdentityDbContext _context;
    private readonly IdentityEmailService _emailService;

    public AuthController(IAuthService authService, IdentityDbContext context, IdentityEmailService emailService)
    {
        _authService   = authService;
        _context       = context;
        _emailService  = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var userId     = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                      ?? User.FindFirst("sub")?.Value;
        var email      = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                      ?? User.FindFirst("email")?.Value;
        var fullName   = User.FindFirst("fullName")?.Value;
        var role       = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var department = User.FindFirst("department")?.Value;

        return Ok(new { userId, email, fullName, role, department });
    }

    [HttpPost("create-employee-account")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> CreateEmployeeAccount([FromBody] CreateEmployeeAccountDto dto)
    {
        try
        {
            var result = await _authService.CreateEmployeeAccountAsync(dto);
            await _emailService.SendWelcomeEmailAsync(
                result.PersonalEmail, result.Email, result.FullName, result.TemporaryPassword);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value;
        if (!int.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Invalid token." });

        var user = await _context.Users.FindAsync(userId);
        if (user is null) return NotFound(new { message = "User not found." });

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    [HttpPost("create-staff-account")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> CreateStaffAccount([FromBody] CreateStaffAccountDto dto)
    {
        try
        {
            var callerRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (callerRole == "HRRecruiter" && dto.Role != "Employee")
                return Forbid();

            var result = await _authService.CreateStaffAccountAsync(dto);
            await _emailService.SendWelcomeEmailAsync(
                dto.PersonalEmail, result.Email, result.FullName, result.TemporaryPassword);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id, u.FullName, u.Email, u.Role,
                u.Department, u.IsActive, u.CreatedAt
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("users/{id}/role")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        var validRoles = new[] { "Employee", "SeniorManager", "HRRecruiter", "ManagementAdmin" };
        if (!validRoles.Contains(dto.Role))
            return BadRequest(new { message = "Invalid role." });

        user.Role       = dto.Role;
        user.Department = dto.Department ?? user.Department;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Role updated successfully.", user.Email, user.Role });
    }

    [HttpPut("users/{id}/toggle-status")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> ToggleUserStatus(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null) return NotFound(new { message = "User not found." });

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();
        return Ok(new
        {
            message  = $"User {(user.IsActive ? "activated" : "deactivated")}.",
            user.Email,
            user.IsActive
        });
    }

    [HttpPost("check-accounts")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> CheckMultipleAccounts([FromBody] List<string> fullNames)
    {
        var existing = await _context.Users
            .Where(u => fullNames.Contains(u.FullName))
            .Select(u => new { u.FullName, u.Email, u.Role })
            .ToListAsync();
        return Ok(existing);
    }

    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        var seedUsers = new[]
        {
            new { FullName = "Admin User",    Email = "admin@nexhire.com",    Password = "Admin@123",    Role = "ManagementAdmin", Department = "Management" },
            new { FullName = "Senior Manager", Email = "manager@nexhire.com", Password = "Manager@123", Role = "SeniorManager",    Department = "Operations" },
            new { FullName = "HR Recruiter",   Email = "hr@nexhire.com",      Password = "HR@123",      Role = "HRRecruiter",     Department = "Human Resources" },
            new { FullName = "John Employee",  Email = "employee@nexhire.com", Password = "Employee@123", Role = "Employee",      Department = "Engineering" }
        };

        int created = 0;
        foreach (var s in seedUsers)
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == s.Email);
            if (!exists)
            {
                _context.Users.Add(new User
                {
                    FullName     = s.FullName,
                    Email        = s.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(s.Password),
                    Role         = s.Role,
                    Department   = s.Department
                });
                created++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Seeded {created} user(s). Already existing users were skipped." });
    }
}
