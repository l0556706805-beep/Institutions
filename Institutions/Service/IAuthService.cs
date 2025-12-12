using System.Threading.Tasks;
using EducationOrdersAPI.DTOs.Auth;
using EducationOrdersAPI.Models;

public interface IAuthService
{
    Task<string> RegisterAsync(RegisterRequest req);
    Task<string> LoginAsync(LoginRequest req);
    Task<User> FindByEmailAsync(string email);
    Task<string> GeneratePasswordResetTokenAsync(User user);
    Task<bool> ResetPasswordAsync(string token, string newPassword);
    Task SendAsync(string to, string subject, string body);
}
