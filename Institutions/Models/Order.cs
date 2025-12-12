using System;
using System.Collections.Generic;

namespace EducationOrdersAPI.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int InstitutionId { get; set; }
        public Institution? Institution { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public decimal TotalAmount { get; set; } = 0;
        public string? Status { get; set; } // Pending | Approved | Shipped | Completed | Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem>? Items { get; set; }
    }
}
