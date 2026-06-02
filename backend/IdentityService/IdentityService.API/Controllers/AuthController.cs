using IdentityService.Application.DTOs;
using IdentityService.Application.Interfaces;
using IdentityService.Domain.Entities;
using IdentityService.Infrastructure.Data;
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

    public AuthController(IAuthService authService, IdentityDbContext context)
    {
        _authService = authService;
        _context = context;
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
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                  ?? User.FindFirst("sub")?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                 ?? User.FindFirst("email")?.Value;
        var fullName = User.FindFirst("fullName")?.Value;
        var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        var department = User.FindFirst("department")?.Value;

        return Ok(new
        {
            userId,
            email,
            fullName,
            role,
            department
        });
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
                    FullName = s.FullName,
                    Email = s.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(s.Password),
                    Role = s.Role,
                    Department = s.Department
                });
                created++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"Seeded {created} user(s). Already existing users were skipped." });
    }
}
