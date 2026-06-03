using HRMSService.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly HRMSDbContext _ctx;
    private readonly IHttpClientFactory _http;

    public AnalyticsController(HRMSDbContext ctx, IHttpClientFactory http)
    {
        _ctx  = ctx;
        _http = http;
    }

    [HttpGet("company-overview")]
    [Authorize(Roles = "ManagementAdmin")]
    public async Task<IActionResult> CompanyOverview()
    {
        var today        = DateTime.Today;
        var currentMonth = today.Month;
        var currentYear  = today.Year;

        var employees       = await _ctx.Employees.ToListAsync();
        var activeEmployees = employees.Count(e => e.Status == "Active");
        var departments     = employees.Select(e => e.Department).Distinct().Count();
        var newThisMonth    = employees.Count(e => e.CreatedAt.Month == currentMonth && e.CreatedAt.Year == currentYear);

        var todayAttendance = await _ctx.AttendanceRecords.Where(a => a.Date.Date == today).ToListAsync();
        var presentToday    = todayAttendance.Count(a => a.Status == "Present");

        var approvedLeaves = await _ctx.LeaveRequests
            .Where(l => l.Status == "Approved" && l.FromDate.Date <= today && l.ToDate.Date >= today)
            .CountAsync();

        var pendingLeaves = await _ctx.LeaveRequests.CountAsync(l => l.Status == "Pending");

        var payrollThisMonth = await _ctx.PayrollRecords
            .Where(p => p.Month == currentMonth && p.Year == currentYear)
            .SumAsync(p => p.NetSalary);

        var deptBreakdown = employees
            .GroupBy(e => e.Department)
            .Select(g => new { department = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToList();

        var attendanceRate = activeEmployees > 0
            ? Math.Round(presentToday * 100.0 / activeEmployees, 1)
            : 0.0;

        return Ok(new
        {
            totalEmployees      = employees.Count,
            activeEmployees,
            departments,
            presentToday,
            onLeave             = approvedLeaves,
            newThisMonth,
            departmentBreakdown = deptBreakdown,
            attendanceRate,
            pendingLeaves,
            payrollThisMonth
        });
    }

    [HttpGet("hr-overview")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> HrOverview()
    {
        var today        = DateTime.Today;
        var currentMonth = today.Month;
        var currentYear  = today.Year;

        var employees    = await _ctx.Employees.ToListAsync();
        var newThisMonth = employees.Count(e => e.CreatedAt.Month == currentMonth && e.CreatedAt.Year == currentYear);

        var todayAttendance  = await _ctx.AttendanceRecords.Where(a => a.Date.Date == today).ToListAsync();
        var todayPresent     = todayAttendance.Count(a => a.Status == "Present");
        var activeEmployees  = employees.Count(e => e.Status == "Active");
        var todayAbsent      = Math.Max(0, activeEmployees - todayPresent);
        var openLeaveRequests = await _ctx.LeaveRequests.CountAsync(l => l.Status == "Pending");

        var deptBreakdown = employees
            .GroupBy(e => e.Department)
            .Select(g => new { department = g.Key, count = g.Count() })
            .OrderByDescending(x => x.count)
            .ToList();

        return Ok(new
        {
            totalEmployees      = employees.Count,
            newThisMonth,
            departmentBreakdown = deptBreakdown,
            openLeaveRequests,
            todayPresent,
            todayAbsent
        });
    }

    [HttpGet("manager-overview/{managerUserId:int}")]
    [Authorize(Roles = "ManagementAdmin,SeniorManager")]
    public async Task<IActionResult> ManagerOverview(int managerUserId)
    {
        var today = DateTime.Today;

        var manager = await _ctx.Employees.FirstOrDefaultAsync(e => e.UserId == managerUserId);
        if (manager is null) return NotFound(new { message = "Manager employee record not found." });

        var team = await _ctx.Employees
            .Where(e => e.Department == manager.Department)
            .ToListAsync();
        var teamIds = team.Select(e => e.Id).ToList();

        var todayAttendance = await _ctx.AttendanceRecords
            .Where(a => a.Date.Date == today && teamIds.Contains(a.EmployeeId))
            .ToListAsync();

        var presentToday = todayAttendance.Count(a => a.Status == "Present");

        var onLeave = await _ctx.LeaveRequests
            .Where(l => teamIds.Contains(l.EmployeeId) && l.Status == "Approved"
                     && l.FromDate.Date <= today && l.ToDate.Date >= today)
            .CountAsync();

        var pendingApprovals = await _ctx.LeaveRequests
            .CountAsync(l => teamIds.Contains(l.EmployeeId) && l.Status == "Pending");

        var pendingReviews = await _ctx.PerformanceReviews
            .CountAsync(r => teamIds.Contains(r.EmployeeId) && r.Status == "Pending");

        var ratings = await _ctx.PerformanceReviews
            .Where(r => teamIds.Contains(r.EmployeeId) && r.ManagerRating > 0)
            .Select(r => r.ManagerRating)
            .ToListAsync();

        var avgRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 1) : 0.0;

        return Ok(new
        {
            teamSize                 = team.Count,
            presentToday,
            onLeave,
            pendingApprovals,
            pendingReviews,
            averagePerformanceRating = avgRating
        });
    }

    [HttpGet("employee-overview/{employeeId:int}")]
    public async Task<IActionResult> EmployeeOverview(int employeeId)
    {
        var today        = DateTime.Today;
        var currentMonth = today.Month;
        var currentYear  = today.Year;
        var daysInMonth  = DateTime.DaysInMonth(currentYear, currentMonth);

        var monthAttendance = await _ctx.AttendanceRecords
            .Where(a => a.EmployeeId == employeeId
                     && a.Date.Month == currentMonth && a.Date.Year == currentYear)
            .ToListAsync();

        var presentDays = monthAttendance.Count(a => a.Status == "Present");
        var leaveDays   = monthAttendance.Count(a => a.Status == "Leave");
        var absentDays  = Math.Max(0, today.Day - presentDays - leaveDays);

        var attendancePct = today.Day > 0
            ? Math.Round(presentDays * 100.0 / today.Day, 1)
            : 0.0;

        var payslip = await _ctx.PayrollRecords
            .Where(p => p.EmployeeId == employeeId && p.Month == currentMonth && p.Year == currentYear)
            .FirstOrDefaultAsync();

        var lastReview = await _ctx.PerformanceReviews
            .Where(r => r.EmployeeId == employeeId && r.ManagerRating > 0)
            .OrderByDescending(r => r.Year).ThenByDescending(r => r.Month)
            .FirstOrDefaultAsync();

        var pendingLeaves = await _ctx.LeaveRequests
            .CountAsync(l => l.EmployeeId == employeeId && l.Status == "Pending");

        return Ok(new
        {
            presentDaysThisMonth    = presentDays,
            absentDaysThisMonth     = absentDays,
            leaveDaysThisMonth      = leaveDays,
            attendancePercentage    = attendancePct,
            currentMonthNetSalary   = payslip?.NetSalary ?? 0,
            lastPerformanceRating   = lastReview?.ManagerRating ?? 0,
            pendingLeaveRequests    = pendingLeaves
        });
    }

    [HttpGet("recruitment-stats")]
    [Authorize(Roles = "ManagementAdmin,HRRecruiter")]
    public async Task<IActionResult> RecruitmentStats()
    {
        try
        {
            var client   = _http.CreateClient("RecruitmentService");
            var response = await client.GetAsync("/api/candidates/stats");
            if (!response.IsSuccessStatusCode)
                return StatusCode(502, new { message = "Recruitment service unavailable." });

            var json = await response.Content.ReadAsStringAsync();
            return Content(json, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch recruitment stats.", detail = ex.Message });
        }
    }
}
