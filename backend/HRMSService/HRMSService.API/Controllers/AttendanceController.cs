using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/attendance")]
[Authorize]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _svc;
    public AttendanceController(IAttendanceService svc) => _svc = svc;

    [HttpPost("checkin")]
    public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto)
    {
        try { return Ok(await _svc.CheckInAsync(dto.EmployeeId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> CheckOut([FromBody] CheckOutDto dto)
    {
        try { return Ok(await _svc.CheckOutAsync(dto.EmployeeId)); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("today")]
    public async Task<IActionResult> Today() =>
        Ok(await _svc.GetTodayAttendanceAsync());

    [HttpGet("employee/{employeeId:int}/{month:int}/{year:int}")]
    public async Task<IActionResult> EmployeeMonthly(int employeeId, int month, int year) =>
        Ok(await _svc.GetEmployeeAttendanceAsync(employeeId, month, year));

    [HttpGet("summary/{month:int}/{year:int}")]
    public async Task<IActionResult> MonthlySummary(int month, int year) =>
        Ok(await _svc.GetMonthlyAttendanceSummaryAsync(month, year));
}
