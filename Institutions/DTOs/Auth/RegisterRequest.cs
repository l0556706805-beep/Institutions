namespace EducationOrdersAPI.DTOs.Auth
{
    public class RegisterRequest
    {
        public int? InstitutionId { get; set; } // optional for Admin
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; } // Admin | Institution
    }
}
