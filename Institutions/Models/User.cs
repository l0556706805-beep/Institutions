using System;
using System.Collections.Generic;

namespace EducationOrdersAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public int? InstitutionId { get; set; }
        public Institution? Institution { get; set; }

        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? Role { get; set; } // Admin | Institution
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
