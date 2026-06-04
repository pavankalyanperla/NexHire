using HRMSService.Application.DTOs;
using HRMSService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _svc;
    public EmployeesController(IEmployeeService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _svc.GetAllEmployeesAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var emp = await _svc.GetEmployeeByIdAsync(id);
        return emp is null ? NotFound() : Ok(emp);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId)
    {
        var emp = await _svc.GetEmployeeByUserIdAsync(userId);
        return emp is null ? NotFound() : Ok(emp);
    }

    [HttpGet("departments/summary")]
    public async Task<IActionResult> DeptSummary() =>
        Ok(await _svc.GetDepartmentSummaryAsync());

    [HttpPost]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
    {
        var emp = await _svc.CreateEmployeeAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = emp.Id }, emp);
    }

    [HttpPost("create-from-hire")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> CreateFromHire([FromBody] CreateFromHireDto dto)
    {
        try
        {
            var employee = await _svc.CreateFromHireAsync(dto);
            return Ok(employee);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
    {
        try { return Ok(await _svc.UpdateEmployeeAsync(id, dto)); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        try { await _svc.DeleteEmployeeAsync(id); return NoContent(); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }
}
