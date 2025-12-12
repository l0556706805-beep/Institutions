using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace EducationOrdersAPI.DTOs
{
    public class CreateOrderRequest
    {
        [Required]
        public int InstitutionId { get; set; }

        [Required]
        public int UserId { get; set; } // אפשר גם לשלוף מה-Token אם תרצה

        [Required]
        public List<CreateOrderItemRequest> Items { get; set; }
    }

    public class CreateOrderItemRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
