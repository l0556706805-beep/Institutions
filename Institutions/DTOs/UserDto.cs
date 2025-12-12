namespace EducationOrdersAPI.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public int? InstitutionId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
     
    }
}
