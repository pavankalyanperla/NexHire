using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentService.Application.DTOs;
using RecruitmentService.Application.Interfaces;

namespace RecruitmentService.API.Controllers;

[ApiController]
[Route("api/jobpostings")]
[Authorize]
public class JobPostingsController : ControllerBase
{
    private readonly IJobPostingService _svc;
    public JobPostingsController(IJobPostingService svc) => _svc = svc;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllJobPostingsAsync());

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var j = await _svc.GetJobPostingByIdAsync(id);
        return j is null ? NotFound() : Ok(j);
    }

    [HttpPost]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Create([FromBody] CreateJobPostingDto dto) =>
        Ok(await _svc.CreateJobPostingAsync(dto));

    [HttpPut("{id:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobPostingDto dto)
    {
        try { return Ok(await _svc.UpdateJobPostingAsync(id, dto)); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        try { await _svc.DeleteJobPostingAsync(id); return NoContent(); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }
}
