using Microsoft.EntityFrameworkCore;
using RecruitmentService.Domain.Entities;

namespace RecruitmentService.Infrastructure.Data;

public class RecruitmentDbContext : DbContext
{
    public RecruitmentDbContext(DbContextOptions<RecruitmentDbContext> options) : base(options) { }

    public DbSet<JobPosting> JobPostings { get; set; }
    public DbSet<CandidateApplication> CandidateApplications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<JobPosting>()
            .Property(j => j.SalaryMin).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<JobPosting>()
            .Property(j => j.SalaryMax).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<CandidateApplication>()
            .HasOne(c => c.JobPosting)
            .WithMany(j => j.Applications)
            .HasForeignKey(c => c.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CandidateApplication>()
            .Property(c => c.ResumeText).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<CandidateApplication>()
            .Property(c => c.AIAnalysis).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<CandidateApplication>()
            .Property(c => c.InterviewQuestions).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<CandidateApplication>()
            .Property(c => c.AnswerEvaluation).HasColumnType("nvarchar(max)");
        modelBuilder.Entity<JobPosting>()
            .Property(j => j.Description).HasColumnType("nvarchar(max)");
    }
}
