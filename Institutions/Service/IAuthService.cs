using System.Threading.Tasks;
using EducationOrdersAPI.DTOs.Auth;
using EducationOrdersAPI.Models;

public interface IAuthService
{
    // רישום משתמש חדש ומחזיר JWT token
    Task<string> RegisterAsync(RegisterRequest req);

    // התחברות משתמש ומחזיר JWT token
    Task<string> LoginAsync(LoginRequest req);

    // מחפש משתמש לפי אימייל
    Task<User?> FindByEmailAsync(string email);

    // יוצר token ייחודי לאיפוס סיסמה, נשמר במסד עם תוקף
    Task<string> GeneratePasswordResetTokenAsync(User user);

    // מאפס סיסמה על פי token ומחזיר הצלחה/כישלון
    Task<bool> ResetPasswordAsync(string token, string newPassword);

    // שולח מייל למשתמש
    Task SendAsync(string to, string subject, string body);
}
