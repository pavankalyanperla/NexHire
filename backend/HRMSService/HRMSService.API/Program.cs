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
