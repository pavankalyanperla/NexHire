using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/leaves")]
[Authorize]
public class LeavesController : ControllerBase
{
    private readonly ILeaveService _svc;
    public LeavesController(ILeaveService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Apply([FromBody] CreateLeaveRequestDto dto) =>
        Ok(await _svc.ApplyLeaveAsync(dto));

    [HttpGet("employee/{employeeId:int}")]
    public async Task<IActionResult> ByEmployee(int employeeId) =>
        Ok(await _svc.GetLeavesByEmployeeAsync(employeeId));

    [HttpGet("pending")]
    [Authorize(Roles = "ManagementAdmin,SeniorManager,HRRecruiter")]
    public async Task<IActionResult> Pending() =>
        Ok(await _svc.GetPendingLeavesAsync());

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "ManagementAdmin,SeniorManager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
    {
        try { return Ok(await _svc.UpdateLeaveStatusAsync(id, dto)); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }
}
