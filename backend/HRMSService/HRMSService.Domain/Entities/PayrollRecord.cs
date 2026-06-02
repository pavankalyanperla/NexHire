namespace HRMSService.Domain.Entities;

public class PayrollRecord
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal BaseSalary { get; set; }
    public decimal HRA { get; set; }
    public decimal TA { get; set; }
    public decimal PF { get; set; }
    public decimal Tax { get; set; }
    public decimal GrossSalary { get; set; }
    public decimal NetSalary { get; set; }
    public string Status { get; set; } = "Generated";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public Employee Employee { get; set; } = null!;
}
