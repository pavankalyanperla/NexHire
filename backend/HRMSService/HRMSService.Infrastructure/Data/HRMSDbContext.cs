using HRMSService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRMSService.Infrastructure.Data;

public class HRMSDbContext : DbContext
{
    public HRMSDbContext(DbContextOptions<HRMSDbContext> options) : base(options) { }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<PayrollRecord> PayrollRecords { get; set; }
    public DbSet<PerformanceReview> PerformanceReviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.EmployeeCode)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .Property(e => e.BaseSalary)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.BaseSalary).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.HRA).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.TA).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.PF).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.Tax).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.GrossSalary).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PayrollRecord>()
            .Property(p => p.NetSalary).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<AttendanceRecord>()
            .HasOne(a => a.Employee)
            .WithMany(e => e.AttendanceRecords)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LeaveRequest>()
            .HasOne(l => l.Employee)
            .WithMany(e => e.LeaveRequests)
            .HasForeignKey(l => l.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PayrollRecord>()
            .HasOne(p => p.Employee)
            .WithMany(e => e.PayrollRecords)
            .HasForeignKey(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PerformanceReview>()
            .HasOne(r => r.Employee)
            .WithMany(e => e.PerformanceReviews)
            .HasForeignKey(r => r.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
