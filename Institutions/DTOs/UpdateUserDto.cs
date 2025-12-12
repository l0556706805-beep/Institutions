namespace EducationOrdersAPI.DTOs
{
    public class UpdateUserDto
    {
        public int InstitutionId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; } // אופציונלי
        public string Role { get; set; }
    }
}
