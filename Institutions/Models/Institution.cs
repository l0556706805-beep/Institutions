using System;
using System.Collections.Generic;

namespace EducationOrdersAPI.Models
{
    public class Institution
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public string ContactName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; }
        public ICollection<Order> Orders { get; set; }
    }
}
