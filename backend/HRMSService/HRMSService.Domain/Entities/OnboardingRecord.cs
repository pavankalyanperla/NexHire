namespace HRMSService.Domain.Entities;

public class OnboardingRecord
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string OfferLetterStatus { get; set; } = "Pending";
    public DateTime? OfferSentDate { get; set; }
    public DateTime? JoiningDate { get; set; }
    public bool IdProofSubmitted { get; set; } = false;
    public bool AadharSubmitted { get; set; } = false;
    public bool PanCardSubmitted { get; set; } = false;
    public bool BankDetailsSubmitted { get; set; } = false;
    public bool EducationCertificatesSubmitted { get; set; } = false;
    public bool LaptopAssigned { get; set; } = false;
    public bool EmailAccountCreated { get; set; } = false;
    public bool AccessCardIssued { get; set; } = false;
    public string Notes { get; set; } = string.Empty;
    public string Status { get; set; } = "InProgress";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Employee Employee { get; set; } = null!;
}
