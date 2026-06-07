namespace IdentityService.Application.DTOs;

public class CreateEmployeeAccountDto
{
    public string FullName       { get; set; } = string.Empty;
    public string PersonalEmail  { get; set; } = string.Empty; // for welcome email
    public string Department     { get; set; } = string.Empty;
    public string Designation    { get; set; } = string.Empty;
}

public class CreateEmployeeAccountResponseDto
{
    public int    UserId            { get; set; }
    public string FullName          { get; set; } = string.Empty;
    public string Email             { get; set; } = string.Empty; // company email (login)
    public string PersonalEmail     { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
    public string Role              { get; set; } = "Employee";
    public string Message           { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword     { get; set; } = string.Empty;
}

public class UpdateUserRoleDto
{
    public string  Role       { get; set; } = string.Empty;
    public string? Department { get; set; }
}

public class CreateStaffAccountDto
{
    public string FullName      { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string Department    { get; set; } = string.Empty;
    public string Designation   { get; set; } = string.Empty;
    public string Role          { get; set; } = "Employee";
}
