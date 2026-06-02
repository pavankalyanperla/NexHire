using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/payroll")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _svc;
    public PayrollController(IPayrollService svc) => _svc = svc;

    [HttpPost("generate")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Generate([FromBody] GeneratePayrollDto dto)
    {
        try { return Ok(await _svc.GeneratePayrollAsync(dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("generate-bulk")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> GenerateBulk([FromQuery] int month, [FromQuery] int year) =>
        Ok(await _svc.GenerateBulkPayrollAsync(month, year));

    [HttpGet("payslip/{employeeId:int}/{month:int}/{year:int}")]
    public async Task<IActionResult> Payslip(int employeeId, int month, int year)
    {
        var p = await _svc.GetPayslipAsync(employeeId, month, year);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("month/{month:int}/{year:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> ByMonth(int month, int year) =>
        Ok(await _svc.GetPayrollByMonthAsync(month, year));
}
