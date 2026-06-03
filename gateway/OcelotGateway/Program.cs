using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("ocelot.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"ocelot.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true);

builder.Services.AddCors(options =>
{
    options.AddPolicy("NgCors", policy =>
        policy.WithOrigins("http://localhost:4200", "http://nexhire-angular")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors("NgCors");
await app.UseOcelot();
app.Run();
