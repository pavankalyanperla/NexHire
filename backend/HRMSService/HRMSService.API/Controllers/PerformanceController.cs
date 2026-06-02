using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/performance")]
[Authorize]
public class PerformanceController : ControllerBase
{
    private readonly IPerformanceService _svc;
    public PerformanceController(IPerformanceService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        try { return Ok(await _svc.CreateReviewAsync(dto)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("employee/{employeeId:int}")]
    public async Task<IActionResult> ByEmployee(int employeeId) =>
        Ok(await _svc.GetReviewsByEmployeeAsync(employeeId));

    [HttpGet("pending")]
    [Authorize(Roles = "ManagementAdmin,SeniorManager")]
    public async Task<IActionResult> Pending() =>
        Ok(await _svc.GetPendingReviewsAsync());

    [HttpPut("{id:int}/manager-review")]
    [Authorize(Roles = "ManagementAdmin,SeniorManager")]
    public async Task<IActionResult> ManagerReview(int id, [FromBody] UpdateManagerReviewDto dto)
    {
        try { return Ok(await _svc.UpdateManagerReviewAsync(id, dto)); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }
}
