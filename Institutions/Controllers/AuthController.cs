using System;
using System.Threading.Tasks;
using EducationOrdersAPI.DTOs.Auth;
using EducationOrdersAPI.Service;
using Microsoft.AspNetCore.Mvc;

namespace EducationOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        // ------------------ REGISTER ------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { error = "Email and Password are required." });
            }

            try
            {
                var token = await _auth.RegisterAsync(req);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ------------------ LOGIN ------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { error = "Email and Password are required." });
            }

            try
            {
                var token = await _auth.LoginAsync(req);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        // ------------------ FORGOT PASSWORD ------------------
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Email))
            {
                return BadRequest(new { error = "Email is required." });
            }

            var user = await _auth.FindByEmailAsync(req.Email);

            // לא חושפים אם המשתמש קיים או לא
            if (user == null)
                return Ok(new { message = "אם האימייל קיים, נשלח קוד איפוס." });

            // יוצרים קוד איפוס
            var resetCode = await _auth.GeneratePasswordResetTokenAsync(user);

            // שליחת מייל (HTML)
            await _auth.SendAsync(
                user.Email,
                "Password Reset",
                $"<p>שלום {user.FullName},</p><p>קוד האיפוס שלך הוא: <strong>{resetCode}</strong></p><p>תוקף הקוד: שעה אחת.</p>"
            );

            return Ok(new { message = "אם האימייל קיים, נשלח קוד איפוס למייל." });
        }

        // ------------------ RESET PASSWORD ------------------
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Token) || string.IsNullOrWhiteSpace(req.NewPassword))
            {
                return BadRequest(new { error = "Token and new password are required." });
            }

            var result = await _auth.ResetPasswordAsync(req.Token, req.NewPassword);

            if (!result)
                return BadRequest(new { error = "Invalid or expired token." });

            return Ok(new { message = "הסיסמה שונתה בהצלחה." });
        }
    }
}
