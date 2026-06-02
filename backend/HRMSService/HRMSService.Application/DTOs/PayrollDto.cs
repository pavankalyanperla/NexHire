namespace HRMSService.Application.DTOs;

public class PayrollRecordDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal HRA { get; set; }
    public decimal TA { get; set; }
    public decimal PF { get; set; }
    public decimal Tax { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}

public class GeneratePayrollDto
{
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
}
