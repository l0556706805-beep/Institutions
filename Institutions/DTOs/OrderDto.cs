using System;
using System.Collections.Generic;
using System.Linq;

namespace EducationOrdersAPI.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }

        public int InstitutionId { get; set; }
        public string? InstitutionName { get; set; }

        public int UserId { get; set; }
        public string? UserFullName { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? Status { get; set; } // Pending | Approved | Shipped | Completed | Cancelled

        public decimal TotalAmount { get; set; }

        public List<OrderItemDto>? Items { get; set; }

        // חישוב סכום הזמנה מהפריטים (מומלץ להשאיר)
        public decimal CalculatedTotal =>
            Items?.Sum(i => i.Price * i.Quantity) ?? 0;
    }
}
