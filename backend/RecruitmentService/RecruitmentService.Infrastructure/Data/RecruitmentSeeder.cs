using RecruitmentService.Domain.Entities;

namespace RecruitmentService.Infrastructure.Data;

public static class RecruitmentSeeder
{
    public static void Seed(RecruitmentDbContext context)
    {
        if (context.JobPostings.Any()) return;

        var now = DateTime.UtcNow;
        var deadline = new DateTime(2026, 6, 30);

        var jobs = new List<JobPosting>
        {
            new()
            {
                Title = "Full Stack Developer",
                Department = "Engineering",
                Description = "We are looking for a skilled Full Stack Developer to join our engineering team. You will build and maintain scalable web applications using Angular and ASP.NET Core.",
                RequiredSkills = "Angular,ASP.NET Core,SQL Server,Docker,Clean Architecture",
                ExperienceLevel = "Senior",
                JobType = "Full-time",
                Location = "Bangalore",
                SalaryMin = 80000,
                SalaryMax = 120000,
                Status = "Open",
                PostedByUserId = 1,
                PostedAt = now,
                Deadline = deadline
            },
            new()
            {
                Title = "ML Engineer",
                Department = "Engineering",
                Description = "Join our AI team to build machine learning models and data pipelines. You will work with Python, TensorFlow, and cloud platforms to develop production-ready ML solutions.",
                RequiredSkills = "Python,TensorFlow,PyTorch,FastAPI,Scikit-learn,Docker",
                ExperienceLevel = "Mid",
                JobType = "Full-time",
                Location = "Bangalore",
                SalaryMin = 70000,
                SalaryMax = 100000,
                Status = "Open",
                PostedByUserId = 1,
                PostedAt = now,
                Deadline = deadline
            },
            new()
            {
                Title = "HR Executive",
                Department = "HR",
                Description = "We are looking for an enthusiastic HR Executive to support our growing team. You will handle recruitment, onboarding, and employee engagement activities.",
                RequiredSkills = "Recruitment,HRMS,Communication,Excel,Employee Relations",
                ExperienceLevel = "Junior",
                JobType = "Full-time",
                Location = "Bangalore",
                SalaryMin = 40000,
                SalaryMax = 60000,
                Status = "Open",
                PostedByUserId = 1,
                PostedAt = now,
                Deadline = deadline
            }
        };

        context.JobPostings.AddRange(jobs);
        context.SaveChanges();
    }
}
