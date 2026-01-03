using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.DTOs.Auth;
using EducationOrdersAPI.Models;
using EducationOrdersAPI.Helpers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace EducationOrdersAPI.Service
{
    public class AuthService : IAuthService
    {
        private readonly InstitutionsContext _ctx;
        private readonly JwtSettings _jwt;
        private readonly PasswordHasher<User> _pwHasher;
        private readonly IEmailService _emailService;

        public AuthService(InstitutionsContext ctx, IOptions<JwtSettings> jwtOptions, IEmailService emailService)
        {
            _ctx = ctx;
            _jwt = jwtOptions.Value;
            _pwHasher = new PasswordHasher<User>();
            _emailService = emailService;
        }

        // ------------------ REGISTER ------------------
        public async Task<string> RegisterAsync(RegisterRequest req)
        {
            var exists = await _ctx.Users.AnyAsync(u => u.Email == req.Email);
            if (exists) throw new Exception("Email already in use.");

            var user = new User
            {
                Email = req.Email,
                FullName = req.FullName,
                InstitutionId = req.InstitutionId,
                Role = req.Role ?? "Institution",
                CreatedAt = DateTime.UtcNow
            };

            user.PasswordHash = _pwHasher.HashPassword(user, req.Password);
            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            return GenerateToken(user);
        }

        // ------------------ LOGIN ------------------
        public async Task<string> LoginAsync(LoginRequest req)
        {
            var user = await _ctx.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user == null) throw new Exception("Invalid credentials.");

            var verify = _pwHasher.VerifyHashedPassword(user, user.PasswordHash, req.Password);
            if (verify == PasswordVerificationResult.Failed) throw new Exception("Invalid credentials.");

            return GenerateToken(user);
        }

        // ------------------ JWT GENERATE ------------------
        private string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("id", user.Id.ToString()),
                new Claim("role", user.Role),
                new Claim("institutionId", user.InstitutionId?.ToString() ?? string.Empty)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpireMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ------------------ FIND BY EMAIL ------------------
        public async Task<User?> FindByEmailAsync(string email)
        {
            return await _ctx.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        // ------------------ GENERATE RESET TOKEN ------------------
        public async Task<string> GeneratePasswordResetTokenAsync(User user)
        {
            if (user == null) throw new Exception("User not found");

            // ליצור GUID חדש עבור הטוקן
            var token = Guid.NewGuid().ToString();

            // שמירה במסד
            var reset = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                Expiration = DateTime.UtcNow.AddHours(1)
            };
            _ctx.PasswordResetTokens.Add(reset);
            await _ctx.SaveChangesAsync();

            return token;
        }

        // ------------------ RESET PASSWORD ------------------
        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
        {
            var resetToken = await _ctx.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);

            if (resetToken == null || resetToken.Expiration < DateTime.UtcNow)
                return false;

            // עדכון סיסמה חדשה
            resetToken.User.PasswordHash = _pwHasher.HashPassword(resetToken.User, newPassword);

            // מחיקה של הטוקן אחרי שימוש
            _ctx.PasswordResetTokens.Remove(resetToken);
            await _ctx.SaveChangesAsync();
            return true;
        }

        // ------------------ SEND EMAIL ------------------
        public async Task SendAsync(string to, string subject, string body)
        {
            if (_emailService != null)
            {
                try
                {
                    Console.WriteLine($"Preparing to send email to {to}");
                    await _emailService.SendEmailAsync(to, subject, body);
                    Console.WriteLine($"Email sent successfully to {to}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Email sending failed: {ex.Message}");
                    throw;
                }
            }
            else
            {
                // fallback - debug only
                Console.WriteLine($"[DEBUG] Sending email to {to} - {subject} - {body}");
            }
        }
    }
}
