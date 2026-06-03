using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using RecruitmentService.Application.Interfaces;
using RecruitmentService.Infrastructure.Data;
using RecruitmentService.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<RecruitmentDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IJobPostingService, JobPostingService>();
builder.Services.AddScoped<ICandidateService,  CandidateService>();

builder.Services.AddHttpClient("ResumeAI", c =>
    c.BaseAddress = new Uri(builder.Configuration["AIServices:ResumeAIUrl"]!));
builder.Services.AddHttpClient("InterviewAI", c =>
    c.BaseAddress = new Uri(builder.Configuration["AIServices:InterviewAIUrl"]!));

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
            ValidateIssuer = true,  ValidIssuer   = jwtIssuer,
            ValidateAudience = true, ValidAudience = jwtAudience,
            ValidateLifetime = true, ClockSkew     = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "NexHire Recruitment Service", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Bearer. Enter: Bearer {token}",
        Name = "Authorization", In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey, Scheme = "Bearer"
    });
});

builder.Services.AddCors(o =>
    o.AddPolicy("NgCors", p =>
        p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));

builder.WebHost.ConfigureKestrel(options =>
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<RecruitmentDbContext>();
    ctx.Database.EnsureCreated();
    RecruitmentSeeder.Seed(ctx);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Recruitment v1"));
}

app.UseStaticFiles();
app.UseCors("NgCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
