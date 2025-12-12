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

        // רישום משתמש חדש
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req)
        {
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

        // התחברות
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
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

        // שליחת טוקן או קוד לאיפוס סיסמה
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
        {
            var user = await _auth.FindByEmailAsync(req.Email);

            // לא חושפים אם המשתמש קיים או לא
            if (user == null)
                return Ok("If the email exists, a reset code was sent.");

            // יוצרים קוד איפוס
            var resetCode = await _auth.GeneratePasswordResetTokenAsync(user);

            // שליחת מייל
            await _auth.SendAsync(
                user.Email,
                "Password Reset",
                $"Your password reset code is: <b>{resetCode}</b>"
            );

            // הדפסה לקונסול — בדיקות
            Console.WriteLine("===== PASSWORD RESET CODE =====");
            Console.WriteLine("USER: " + user.Email);
            Console.WriteLine("RESET CODE: " + resetCode);
            Console.WriteLine("================================");

            return Ok (new {massage= "A reset email has been sent.", resetCode });
        }

        // איפוס סיסמה בפועל
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
        {
            if (string.IsNullOrEmpty(req.Token))
                return BadRequest("Token is required");

            var result = await _auth.ResetPasswordAsync(req.Token, req.NewPassword);

            if (!result)
                return BadRequest("Invalid or expired token");

            return Ok("Password has been reset successfully.");
        }
    }
}
