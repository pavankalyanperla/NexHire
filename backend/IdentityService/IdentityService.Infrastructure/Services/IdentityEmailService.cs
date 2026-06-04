using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace IdentityService.Infrastructure.Services;

public class IdentityEmailService
{
    private readonly string _smtpHost = "smtp.gmail.com";
    private readonly int _smtpPort = 587;
    private readonly string _fromEmail;
    private readonly string _fromPassword;

    public IdentityEmailService(IConfiguration config)
    {
        _fromEmail    = config["EmailSettings:FromEmail"]    ?? "";
        _fromPassword = config["EmailSettings:FromPassword"] ?? "";
    }

    public async Task SendWelcomeEmailAsync(string toEmail, string fullName, string tempPassword)
    {
        if (string.IsNullOrEmpty(_fromEmail) || string.IsNullOrEmpty(_fromPassword)) return;

        try
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl   = true,
                Credentials = new NetworkCredential(_fromEmail, _fromPassword)
            };

            var body = $"""
                <div style="font-family:Arial,sans-serif;max-width:600px">
                  <h2 style="color:#6366f1">Welcome to NexHire!</h2>
                  <p>Dear {fullName},</p>
                  <p>Your employee account has been created successfully. Here are your login credentials:</p>
                  <div style="background:#f0f7ff;padding:16px;border-radius:8px;margin:12px 0;border:1px solid #bfdbfe">
                    <p style="margin:4px 0"><b>Portal URL:</b> http://localhost:4200</p>
                    <p style="margin:4px 0"><b>Email:</b> {toEmail}</p>
                    <p style="margin:4px 0"><b>Temporary Password:</b> <code style="background:#fff;padding:2px 6px;border-radius:4px">{tempPassword}</code></p>
                  </div>
                  <p style="color:#dc2626"><b>Important:</b> Please change your password after your first login using the "Change Password" option in the portal.</p>
                  <p>You can now access your payslips, attendance, leave management, and more through the NexHire employee portal.</p>
                  <br/>
                  <p>Welcome aboard!<br/><b>NexHire HR Team</b></p>
                </div>
                """;

            var message = new MailMessage
            {
                From       = new MailAddress(_fromEmail, "NexHire HR Team"),
                Subject    = "Welcome to NexHire — Your Login Credentials",
                Body       = body,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail, fullName));
            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[IdentityEmailService] Welcome email failed to {toEmail}: {ex.Message}");
        }
    }
}
