using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace RecruitmentService.Infrastructure.Services;

public class EmailService
{
    private readonly string _smtpHost = "smtp.gmail.com";
    private readonly int _smtpPort = 587;
    private readonly string _fromEmail;
    private readonly string _fromPassword;
    private const string _fromName = "NexHire HR Team";

    public EmailService(IConfiguration config)
    {
        _fromEmail    = config["EmailSettings:FromEmail"]    ?? "";
        _fromPassword = config["EmailSettings:FromPassword"] ?? "";
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string body)
    {
        if (string.IsNullOrEmpty(_fromEmail) || string.IsNullOrEmpty(_fromPassword)) return;

        try
        {
            using var client = new SmtpClient(_smtpHost, _smtpPort)
            {
                EnableSsl   = true,
                Credentials = new NetworkCredential(_fromEmail, _fromPassword)
            };

            var message = new MailMessage
            {
                From       = new MailAddress(_fromEmail, _fromName),
                Subject    = subject,
                Body       = body,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail, toName));

            await client.SendMailAsync(message);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[EmailService] Send failed to {toEmail}: {ex.Message}");
            // Email failure must not break the main flow
        }
    }

    public string GetApplicationReceivedEmail(string candidateName, string jobTitle) => $"""
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2 style="color:#6366f1">Application Received — {jobTitle}</h2>
          <p>Dear {candidateName},</p>
          <p>Thank you for applying for the <b>{jobTitle}</b> position at NexHire.</p>
          <p>We have received your application and our HR team will review it shortly.
             We will keep you updated on the status of your application.</p>
          <br/>
          <p>Best regards,<br/><b>NexHire HR Team</b></p>
        </div>
        """;

    public string GetShortlistedEmail(string candidateName, string jobTitle) => $"""
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2 style="color:#22c55e">Congratulations! You've been Shortlisted</h2>
          <p>Dear {candidateName},</p>
          <p>We are pleased to inform you that you have been <b>shortlisted</b>
             for the <b>{jobTitle}</b> position at NexHire.</p>
          <p>Our HR team will contact you shortly to schedule an interview.</p>
          <br/>
          <p>Best regards,<br/><b>NexHire HR Team</b></p>
        </div>
        """;

    public string GetInterviewScheduledEmail(string candidateName, string jobTitle) => $"""
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2 style="color:#6366f1">Interview Scheduled — {jobTitle}</h2>
          <p>Dear {candidateName},</p>
          <p>Your interview for the <b>{jobTitle}</b> position has been scheduled.</p>
          <p>Please be prepared to answer technical and HR questions.
             We look forward to speaking with you!</p>
          <br/>
          <p>Best regards,<br/><b>NexHire HR Team</b></p>
        </div>
        """;

    public string GetHiredEmail(string candidateName, string jobTitle) => $"""
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2 style="color:#22c55e">Offer Letter — Welcome to NexHire!</h2>
          <p>Dear {candidateName},</p>
          <p>We are thrilled to offer you the position of <b>{jobTitle}</b> at NexHire.</p>
          <p>Our HR team will be in touch shortly with your onboarding details,
             joining date, and required documents. Welcome to the NexHire family!</p>
          <br/>
          <p>Best regards,<br/><b>NexHire HR Team</b></p>
        </div>
        """;

    public string GetRejectedEmail(string candidateName, string jobTitle) => $"""
        <div style="font-family:Arial,sans-serif;max-width:600px">
          <h2 style="color:#ef4444">Application Update — {jobTitle}</h2>
          <p>Dear {candidateName},</p>
          <p>Thank you for your interest in the <b>{jobTitle}</b> position at NexHire.</p>
          <p>After careful consideration, we regret to inform you that we will not be
             moving forward with your application at this time.</p>
          <p>We encourage you to apply for future openings that match your profile.</p>
          <br/>
          <p>Best regards,<br/><b>NexHire HR Team</b></p>
        </div>
        """;
}
