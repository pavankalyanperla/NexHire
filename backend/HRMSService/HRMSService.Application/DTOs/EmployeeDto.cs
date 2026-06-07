namespace HRMSService.Application.DTOs;

public class EmployeeDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateEmployeeDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime JoiningDate { get; set; }
    public decimal BaseSalary { get; set; }
}

public class UpdateEmployeeDto
{
    public string Phone { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal BaseSalary { get; set; }
    public string? Email { get; set; }
}

public class DepartmentSummaryDto
{
    public string Department { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class CreateFromHireDto
{
    public int      UserId      { get; set; }
    public string   FullName    { get; set; } = string.Empty;
    public string   Email       { get; set; } = string.Empty; // company email
    public string   Department  { get; set; } = string.Empty;
    public string   Designation { get; set; } = string.Empty;
    public string   Role        { get; set; } = "Employee";
    public DateTime JoiningDate { get; set; }
}
