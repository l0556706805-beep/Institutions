using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

public class EmailSettings
{
    public string? Server { get; set; }
    public int Port { get; set; }
    public string? SenderName { get; set; }
    public string? SenderEmail { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
}

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
}

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;
        email.Body = new TextPart("html") { Text = body };

        using var smtp = new SmtpClient();

        try
        {
            Console.WriteLine($"Connecting to SMTP server: {_settings.Server}:{_settings.Port}");
            await smtp.ConnectAsync(_settings.Server, _settings.Port, MailKit.Security.SecureSocketOptions.StartTls);

            Console.WriteLine("Authenticating...");
            await smtp.AuthenticateAsync(_settings.Username, _settings.Password);

            Console.WriteLine("Sending email...");
            await smtp.SendAsync(email);

            Console.WriteLine($"Email sent successfully to {to}");
        }
        catch (Exception ex)
        {
            Console.WriteLine("Email sending failed: " + ex.Message);
            throw; // זרוק את השגיאה כדי ש־AuthService ידע שהשליחה נכשלה
        }
        finally
        {
            if (smtp.IsConnected)
                await smtp.DisconnectAsync(true);
        }
    }
}
