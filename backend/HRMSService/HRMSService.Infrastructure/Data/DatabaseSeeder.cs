using HRMSService.Domain.Entities;

namespace HRMSService.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static void Seed(HRMSDbContext context)
    {
        if (context.Employees.Any()) return;

        var now = DateTime.UtcNow;
        var joinDate = new DateTime(2023, 1, 15);

        var employees = new List<Employee>
        {
            // UserId maps to IdentityDB: 1=Admin, 2=Manager, 3=HR, 4=Employee demo account
            // Demo-only employees (no login account) use UserId=0 to avoid collisions
            new() { UserId=4, EmployeeCode="NX-001", FullName="Alice Johnson",  Email="alice@nexhire.com",  Phone="9100000001", Department="Engineering", Designation="Senior Developer",  Role="Employee",        JoiningDate=joinDate, BaseSalary=85000, Status="Active", CreatedAt=now },
            new() { UserId=0, EmployeeCode="NX-002", FullName="Bob Smith",      Email="bob@nexhire.com",    Phone="9100000002", Department="Engineering", Designation="Junior Developer",  Role="Employee",        JoiningDate=joinDate, BaseSalary=55000, Status="Active", CreatedAt=now },
            new() { UserId=3, EmployeeCode="NX-003", FullName="Carol White",    Email="carol@nexhire.com",  Phone="9100000003", Department="HR",          Designation="HR Executive",      Role="HRRecruiter",     JoiningDate=joinDate, BaseSalary=60000, Status="Active", CreatedAt=now },
            new() { UserId=2, EmployeeCode="NX-004", FullName="David Brown",    Email="david@nexhire.com",  Phone="9100000004", Department="HR",          Designation="HR Manager",        Role="SeniorManager",   JoiningDate=joinDate, BaseSalary=75000, Status="Active", CreatedAt=now },
            new() { UserId=0, EmployeeCode="NX-005", FullName="Eva Green",      Email="eva@nexhire.com",    Phone="9100000005", Department="Finance",     Designation="Accountant",        Role="Employee",        JoiningDate=joinDate, BaseSalary=65000, Status="Active", CreatedAt=now },
            new() { UserId=0, EmployeeCode="NX-006", FullName="Frank Lee",      Email="frank@nexhire.com",  Phone="9100000006", Department="Finance",     Designation="Finance Manager",   Role="SeniorManager",   JoiningDate=joinDate, BaseSalary=80000, Status="Active", CreatedAt=now },
            new() { UserId=0, EmployeeCode="NX-007", FullName="Grace Kim",      Email="grace@nexhire.com",  Phone="9100000007", Department="Operations",  Designation="Operations Lead",   Role="SeniorManager",   JoiningDate=joinDate, BaseSalary=70000, Status="Active", CreatedAt=now },
            new() { UserId=1, EmployeeCode="NX-008", FullName="Henry Wilson",   Email="henry@nexhire.com",  Phone="9100000008", Department="Operations",  Designation="Admin",             Role="ManagementAdmin", JoiningDate=joinDate, BaseSalary=90000, Status="Active", CreatedAt=now }
        };

        context.Employees.AddRange(employees);
        context.SaveChanges();

        var dates = new[] { new DateTime(2026, 6, 1) };
        var attendance = new List<AttendanceRecord>();
        foreach (var emp in employees)
        {
            foreach (var date in dates)
            {
                attendance.Add(new AttendanceRecord
                {
                    EmployeeId   = emp.Id,
                    Date         = date,
                    CheckInTime  = new TimeSpan(9, 0, 0),
                    CheckOutTime = new TimeSpan(18, 0, 0),
                    WorkingHours = 9.0,
                    Status       = "Present"
                });
            }
        }
        context.AttendanceRecords.AddRange(attendance);
        context.SaveChanges();

        var payrolls = new List<PayrollRecord>();
        foreach (var emp in employees)
        {
            var hra   = Math.Round(emp.BaseSalary * 0.40m, 2);
            var ta    = Math.Round(emp.BaseSalary * 0.10m, 2);
            var gross = emp.BaseSalary + hra + ta;
            var pf    = Math.Round(emp.BaseSalary * 0.12m, 2);
            var tax   = Math.Round(gross * 0.10m, 2);
            payrolls.Add(new PayrollRecord
            {
                EmployeeId  = emp.Id,
                Month       = 6, Year = 2026,
                BaseSalary  = emp.BaseSalary,
                HRA = hra, TA = ta, GrossSalary = Math.Round(gross, 2),
                PF = pf, Tax = tax, NetSalary = Math.Round(gross - pf - tax, 2),
                Status = "Generated", GeneratedAt = now
            });
        }
        context.PayrollRecords.AddRange(payrolls);
        context.SaveChanges();

        var reviews = new List<PerformanceReview>();
        foreach (var emp in employees)
        {
            reviews.Add(new PerformanceReview
            {
                EmployeeId      = emp.Id,
                ReviewerUserId  = 1,
                Month = 6, Year = 2026,
                SelfRating      = 4,
                ManagerRating   = 0,
                SelfComments    = "Good performance this month, met all targets.",
                ManagerComments = "",
                Goals           = "Complete Q3 objectives on time.",
                Status          = "Pending"
            });
        }
        context.PerformanceReviews.AddRange(reviews);
        context.SaveChanges();
    }
}
