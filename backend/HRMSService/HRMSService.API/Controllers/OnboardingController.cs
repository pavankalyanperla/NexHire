using HRMSService.Domain.Entities;
using HRMSService.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.API.Controllers;

public record CreateOnboardingDto(
    int? EmployeeId,
    string CandidateName,
    string CandidateEmail,
    DateTime? JoiningDate,
    string Notes);

public record UpdateOnboardingDto(
    string OfferLetterStatus, bool IdProofSubmitted, bool AadharSubmitted,
    bool PanCardSubmitted, bool BankDetailsSubmitted, bool EducationCertificatesSubmitted,
    bool LaptopAssigned, bool EmailAccountCreated, bool AccessCardIssued,
    string Notes, string Status, DateTime? JoiningDate);

public record UpdateOfferStatusDto(string OfferLetterStatus);

[ApiController]
[Route("api/onboarding")]
[Authorize]
public class OnboardingController : ControllerBase
{
    private readonly HRMSDbContext _ctx;
    public OnboardingController(HRMSDbContext ctx) => _ctx = ctx;

    [HttpGet]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> GetAll()
    {
        var records = await _ctx.OnboardingRecords
            .Include(o => o.Employee)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => ToDto(o))
            .ToListAsync();
        return Ok(records);
    }

    [HttpGet("{employeeId:int}")]
    public async Task<IActionResult> GetByEmployee(int employeeId)
    {
        var record = await _ctx.OnboardingRecords
            .Include(o => o.Employee)
            .FirstOrDefaultAsync(o => o.EmployeeId == employeeId);
        return record is null ? NotFound() : Ok(ToDto(record));
    }

    [HttpPost]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Create([FromBody] CreateOnboardingDto dto)
    {
        // Uniqueness check by EmployeeId (for linked employees) or CandidateEmail (for new hires)
        if (dto.EmployeeId.HasValue && dto.EmployeeId.Value > 0)
        {
            var exists = await _ctx.OnboardingRecords.AnyAsync(o => o.EmployeeId == dto.EmployeeId);
            if (exists) return BadRequest(new { message = "Onboarding record already exists for this employee." });
        }
        else if (!string.IsNullOrWhiteSpace(dto.CandidateEmail))
        {
            var exists = await _ctx.OnboardingRecords.AnyAsync(
                o => o.CandidateEmail == dto.CandidateEmail);
            if (exists) return BadRequest(new { message = $"Onboarding record already exists for {dto.CandidateName}." });
        }

        var record = new OnboardingRecord
        {
            EmployeeId     = dto.EmployeeId is > 0 ? dto.EmployeeId : null,
            CandidateName  = dto.CandidateName ?? string.Empty,
            CandidateEmail = dto.CandidateEmail ?? string.Empty,
            JoiningDate    = dto.JoiningDate,
            Notes          = dto.Notes ?? string.Empty,
            CreatedAt      = DateTime.UtcNow
        };
        _ctx.OnboardingRecords.Add(record);
        await _ctx.SaveChangesAsync();

        if (record.EmployeeId.HasValue)
            await _ctx.Entry(record).Reference(o => o.Employee).LoadAsync();

        return Ok(ToDto(record));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateOnboardingDto dto)
    {
        var record = await _ctx.OnboardingRecords.Include(o => o.Employee).FirstOrDefaultAsync(o => o.Id == id);
        if (record is null) return NotFound();

        record.OfferLetterStatus               = dto.OfferLetterStatus;
        record.IdProofSubmitted                = dto.IdProofSubmitted;
        record.AadharSubmitted                 = dto.AadharSubmitted;
        record.PanCardSubmitted                = dto.PanCardSubmitted;
        record.BankDetailsSubmitted            = dto.BankDetailsSubmitted;
        record.EducationCertificatesSubmitted  = dto.EducationCertificatesSubmitted;
        record.LaptopAssigned                  = dto.LaptopAssigned;
        record.EmailAccountCreated             = dto.EmailAccountCreated;
        record.AccessCardIssued                = dto.AccessCardIssued;
        record.Notes                           = dto.Notes ?? string.Empty;
        record.Status                          = dto.Status;
        if (dto.JoiningDate.HasValue) record.JoiningDate = dto.JoiningDate;

        var allDocsDone = record.IdProofSubmitted && record.AadharSubmitted && record.PanCardSubmitted
                       && record.BankDetailsSubmitted && record.EducationCertificatesSubmitted;
        var allItDone   = record.LaptopAssigned && record.EmailAccountCreated && record.AccessCardIssued;
        if (allDocsDone && allItDone && record.OfferLetterStatus == "Accepted")
            record.Status = "Completed";

        await _ctx.SaveChangesAsync();
        return Ok(ToDto(record));
    }

    [HttpPut("{id:int}/offer-status")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> UpdateOfferStatus(int id, [FromBody] UpdateOfferStatusDto dto)
    {
        var record = await _ctx.OnboardingRecords.Include(o => o.Employee).FirstOrDefaultAsync(o => o.Id == id);
        if (record is null) return NotFound();

        record.OfferLetterStatus = dto.OfferLetterStatus;
        if (dto.OfferLetterStatus == "Sent") record.OfferSentDate = DateTime.UtcNow;

        await _ctx.SaveChangesAsync();
        return Ok(ToDto(record));
    }

    private static object ToDto(OnboardingRecord o) => new
    {
        o.Id, o.EmployeeId,
        employeeName           = o.Employee?.FullName ?? o.CandidateName,
        department             = o.Employee?.Department ?? "New Hire",
        candidateName          = o.CandidateName,
        candidateEmail         = o.CandidateEmail,
        o.OfferLetterStatus, o.OfferSentDate, o.JoiningDate,
        o.IdProofSubmitted, o.AadharSubmitted, o.PanCardSubmitted,
        o.BankDetailsSubmitted, o.EducationCertificatesSubmitted,
        o.LaptopAssigned, o.EmailAccountCreated, o.AccessCardIssued,
        o.Notes, o.Status, o.CreatedAt,
        docsCount = CountDocs(o),
        itCount   = CountIt(o)
    };

    private static int CountDocs(OnboardingRecord o) =>
        (o.IdProofSubmitted ? 1 : 0) + (o.AadharSubmitted ? 1 : 0) +
        (o.PanCardSubmitted ? 1 : 0) + (o.BankDetailsSubmitted ? 1 : 0) +
        (o.EducationCertificatesSubmitted ? 1 : 0);

    private static int CountIt(OnboardingRecord o) =>
        (o.LaptopAssigned ? 1 : 0) + (o.EmailAccountCreated ? 1 : 0) + (o.AccessCardIssued ? 1 : 0);
}
