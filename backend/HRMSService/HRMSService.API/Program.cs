using System.Text;
using HRMSService.Application.Interfaces;
using HRMSService.Infrastructure.Data;
using HRMSService.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<HRMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient("RecruitmentService", c =>
    c.BaseAddress = new Uri("http://localhost:5300"));

builder.Services.AddScoped<IEmployeeService,   EmployeeService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<ILeaveService,      LeaveService>();
builder.Services.AddScoped<IPayrollService,    PayrollService>();
builder.Services.AddScoped<IPerformanceService,PerformanceService>();

var jwtSecret   = builder.Configuration["JwtSettings:Secret"]!;
var jwtIssuer   = builder.Configuration["JwtSettings:Issuer"]!;
var jwtAudience = builder.Configuration["JwtSettings:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer           = true,
            ValidIssuer              = jwtIssuer,
            ValidateAudience         = true,
            ValidAudience            = jwtAudience,
            ValidateLifetime         = true,
            ClockSkew                = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "NexHire HRMS Service", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization. Enter: Bearer {token}",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer"
    });
});

builder.Services.AddCors(o =>
    o.AddPolicy("NgCors", p =>
        p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Run seeder
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<HRMSDbContext>();
    ctx.Database.EnsureCreated();

    // Idempotent schema migration: support onboarding records for new hires not yet in Employees table
    try
    {
        ctx.Database.ExecuteSqlRaw(@"
            IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_OnboardingRecords_Employees_EmployeeId')
                ALTER TABLE OnboardingRecords DROP CONSTRAINT FK_OnboardingRecords_Employees_EmployeeId");

        ctx.Database.ExecuteSqlRaw(@"
            IF EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME='OnboardingRecords' AND COLUMN_NAME='EmployeeId' AND IS_NULLABLE='NO'
            )
            ALTER TABLE OnboardingRecords ALTER COLUMN EmployeeId INT NULL");

        ctx.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_OnboardingRecords_Employees_EmployeeId')
                ALTER TABLE OnboardingRecords ADD CONSTRAINT FK_OnboardingRecords_Employees_EmployeeId
                FOREIGN KEY (EmployeeId) REFERENCES Employees(Id) ON DELETE CASCADE");

        ctx.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME='OnboardingRecords' AND COLUMN_NAME='CandidateName'
            )
            ALTER TABLE OnboardingRecords ADD CandidateName NVARCHAR(MAX) NULL");

        ctx.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME='OnboardingRecords' AND COLUMN_NAME='CandidateEmail'
            )
            ALTER TABLE OnboardingRecords ADD CandidateEmail NVARCHAR(MAX) NULL");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Schema migration] {ex.Message}");
    }

    DatabaseSeeder.Seed(ctx);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "HRMS v1"));
}

app.UseCors("NgCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
