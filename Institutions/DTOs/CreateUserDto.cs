namespace EducationOrdersAPI.DTOs
{
    public class CreateUserDto
    {
        public int InstitutionId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }
}
