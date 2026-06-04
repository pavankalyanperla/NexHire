using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RecruitmentService.Application.DTOs;
using RecruitmentService.Application.Interfaces;
using RecruitmentService.Infrastructure.Services;

namespace RecruitmentService.API.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIRecruitmentController : ControllerBase
{
    private readonly ICandidateService _candidateSvc;
    private readonly IJobPostingService _jobSvc;
    private readonly IHttpClientFactory _http;
    private readonly EmailService _email;

    public AIRecruitmentController(
        ICandidateService candidateSvc, IJobPostingService jobSvc,
        IHttpClientFactory http, EmailService email)
    {
        _candidateSvc = candidateSvc;
        _jobSvc       = jobSvc;
        _http         = http;
        _email        = email;
    }

    [HttpPost("screen/{applicationId:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> ScreenResume(int applicationId)
    {
        var app = await _candidateSvc.GetApplicationByIdAsync(applicationId);
        if (app is null) return NotFound(new { message = "Application not found." });

        var job = await _jobSvc.GetJobPostingByIdAsync(app.JobPostingId);
        if (job is null) return NotFound(new { message = "Job posting not found." });

        // Use extracted resume text; fall back to candidate info for demo
        var resumeText = !string.IsNullOrWhiteSpace(app.ResumeText)
            ? app.ResumeText
            : $"Candidate: {app.CandidateName}. Email: {app.CandidateEmail}. Applied for {job.Title}.";

        var screenPayload = new
        {
            resume_text      = resumeText,
            job_title        = job.Title,
            required_skills  = job.RequiredSkills,
            experience_level = job.ExperienceLevel,
            job_description  = job.Description
        };

        var client  = _http.CreateClient("ResumeAI");
        var content = new StringContent(JsonSerializer.Serialize(screenPayload), Encoding.UTF8, "application/json");

        try
        {
            var response    = await client.PostAsync("/api/resume/screen", content);
            var responseStr = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "AI service error", detail = responseStr });

            var doc       = JsonDocument.Parse(responseStr);
            var matchScore = doc.RootElement.TryGetProperty("match_score", out var se) ? se.GetInt32() : 0;

            await _candidateSvc.SaveAIScreeningResultAsync(applicationId, matchScore, responseStr);

            var result = new AIScreeningResultDto
            {
                ApplicationId  = applicationId,
                CandidateName  = app.CandidateName,
                MatchScore     = matchScore,
                Recommendation = doc.RootElement.TryGetProperty("recommendation", out var re) ? re.GetString() ?? "" : "",
                Summary        = doc.RootElement.TryGetProperty("summary", out var su) ? su.GetString() ?? "" : "",
                RawAnalysis    = responseStr
            };
            if (doc.RootElement.TryGetProperty("matched_skills", out var ms))
                result.MatchedSkills = ms.EnumerateArray().Select(x => x.GetString() ?? "").ToList();
            if (doc.RootElement.TryGetProperty("missing_skills", out var mi))
                result.MissingSkills = mi.EnumerateArray().Select(x => x.GetString() ?? "").ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Screening failed", detail = ex.Message });
        }
    }

    [HttpPost("rank/{jobId:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> RankCandidates(int jobId)
    {
        var job = await _jobSvc.GetJobPostingByIdAsync(jobId);
        if (job is null) return NotFound(new { message = "Job posting not found." });

        var applications = (await _candidateSvc.GetApplicationsByJobAsync(jobId)).ToList();
        if (!applications.Any())
            return Ok(new { message = "No applications to rank.", candidates = Array.Empty<object>() });

        var candidates = applications.Select(a => new
        {
            application_id = a.Id,
            candidate_name = a.CandidateName,
            resume_text    = !string.IsNullOrWhiteSpace(a.ResumeText)
                ? a.ResumeText
                : $"Candidate: {a.CandidateName}, Email: {a.CandidateEmail}"
        }).ToList();

        var rankPayload = new
        {
            candidates      = candidates,
            job_title       = job.Title,
            required_skills = job.RequiredSkills,
            job_description = job.Description
        };

        var client  = _http.CreateClient("ResumeAI");
        var content = new StringContent(JsonSerializer.Serialize(rankPayload), Encoding.UTF8, "application/json");

        try
        {
            var response    = await client.PostAsync("/api/resume/rank", content);
            var responseStr = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "AI ranking error", detail = responseStr });

            var rankResults = JsonDocument.Parse(responseStr);
            foreach (var item in rankResults.RootElement.EnumerateArray())
            {
                var appId = item.TryGetProperty("application_id", out var idEl) ? idEl.GetInt32() : 0;
                var score = item.TryGetProperty("match_score", out var scEl) ? scEl.GetInt32() : 0;
                if (appId > 0) await _candidateSvc.SaveAIScreeningResultAsync(appId, score, item.GetRawText());
            }
            return Ok(await _candidateSvc.GetRankedCandidatesAsync(jobId));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ranking failed", detail = ex.Message });
        }
    }

    [HttpPost("questions/{applicationId:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> GenerateQuestions(int applicationId)
    {
        var app = await _candidateSvc.GetApplicationByIdAsync(applicationId);
        if (app is null) return NotFound(new { message = "Application not found." });

        var job = await _jobSvc.GetJobPostingByIdAsync(app.JobPostingId);
        if (job is null) return NotFound(new { message = "Job posting not found." });

        var qPayload = new
        {
            job_title        = job.Title,
            required_skills  = job.RequiredSkills,
            experience_level = job.ExperienceLevel,
            candidate_name   = app.CandidateName
        };

        var client  = _http.CreateClient("InterviewAI");
        var content = new StringContent(JsonSerializer.Serialize(qPayload), Encoding.UTF8, "application/json");

        try
        {
            var response      = await client.PostAsync("/api/interview/generate-questions", content);
            var questionsJson = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "AI question generation error", detail = questionsJson });
            await _candidateSvc.SaveInterviewQuestionsAsync(applicationId, questionsJson);

            // Notify candidate that interview has been scheduled
            await _email.SendEmailAsync(
                app.CandidateEmail, app.CandidateName,
                $"Interview Scheduled — {job.Title}",
                _email.GetInterviewScheduledEmail(app.CandidateName, job.Title));

            return Ok(JsonDocument.Parse(questionsJson).RootElement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Question generation failed", detail = ex.Message });
        }
    }

    [HttpPost("evaluate/{applicationId:int}")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> EvaluateAnswers(int applicationId, [FromBody] JsonElement answersPayload)
    {
        var client  = _http.CreateClient("InterviewAI");
        var content = new StringContent(answersPayload.GetRawText(), Encoding.UTF8, "application/json");

        try
        {
            var response  = await client.PostAsync("/api/interview/evaluate-answers", content);
            var evalJson  = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "Evaluation error", detail = evalJson });
            await _candidateSvc.SaveAnswerEvaluationAsync(applicationId, evalJson);
            return Ok(JsonDocument.Parse(evalJson).RootElement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Evaluation failed", detail = ex.Message });
        }
    }

    [HttpPost("performance-insights/{employeeId:int}")]
    public async Task<IActionResult> PerformanceInsights(int employeeId, [FromBody] JsonElement data)
    {
        var client  = _http.CreateClient("InterviewAI");
        var content = new StringContent(data.GetRawText(), Encoding.UTF8, "application/json");
        try
        {
            var response     = await client.PostAsync("/api/interview/performance-insights", content);
            var insightsJson = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "Performance insights error", detail = insightsJson });
            return Ok(JsonDocument.Parse(insightsJson).RootElement);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Performance insights failed", detail = ex.Message });
        }
    }
}
