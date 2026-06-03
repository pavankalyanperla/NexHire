using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentService.Application.DTOs;
using RecruitmentService.Application.Interfaces;

namespace RecruitmentService.API.Controllers;

[ApiController]
[Route("api/candidates")]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _svc;
    private readonly IHttpClientFactory _http;
    private readonly IWebHostEnvironment _env;

    public CandidatesController(ICandidateService svc, IHttpClientFactory http, IWebHostEnvironment env)
    {
        _svc  = svc;
        _http  = http;
        _env   = env;
    }

    [HttpGet("job/{jobId:int}")]
    [Authorize]
    public async Task<IActionResult> ByJob(int jobId) =>
        Ok(await _svc.GetApplicationsByJobAsync(jobId));

    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _svc.GetApplicationByIdAsync(id);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpGet("job/{jobId:int}/ranked")]
    [Authorize]
    public async Task<IActionResult> Ranked(int jobId) =>
        Ok(await _svc.GetRankedCandidatesAsync(jobId));

    [HttpPost("apply")]
    [AllowAnonymous]
    public async Task<IActionResult> Apply([FromForm] CreateApplicationDto dto, IFormFile? resume)
    {
        string resumeFilePath = "";
        string resumeText = "";

        if (resume is not null && resume.Length > 0)
        {
            var uploadsDir = Path.Combine(_env.ContentRootPath, "Uploads", "Resumes");
            Directory.CreateDirectory(uploadsDir);
            var fileName = $"{Guid.NewGuid()}_{resume.FileName}";
            var fullPath = Path.Combine(uploadsDir, fileName);

            using (var stream = System.IO.File.Create(fullPath))
                await resume.CopyToAsync(stream);

            resumeFilePath = $"/Uploads/Resumes/{fileName}";

            // Call ResumeAI to extract text
            try
            {
                var client = _http.CreateClient("ResumeAI");
                using var formContent = new MultipartFormDataContent();
                var fileBytes = await System.IO.File.ReadAllBytesAsync(fullPath);
                var fileContent = new ByteArrayContent(fileBytes);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
                formContent.Add(fileContent, "file", resume.FileName);

                var response = await client.PostAsync("/api/resume/extract-text", formContent);
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var result = System.Text.Json.JsonDocument.Parse(json);
                    resumeText = result.RootElement.GetProperty("text").GetString() ?? "";
                }
            }
            catch { /* AI extraction failed — proceed without text */ }
        }

        var application = await _svc.CreateApplicationAsync(dto, resumeFilePath, resumeText);
        return Ok(application);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateApplicationStatusDto dto)
    {
        try { return Ok(await _svc.UpdateApplicationStatusAsync(id, dto)); }
        catch (InvalidOperationException ex) { return NotFound(new { message = ex.Message }); }
    }
}
