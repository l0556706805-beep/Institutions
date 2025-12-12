namespace EducationOrdersAPI.DTOs
{
    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }

        public decimal Price { get; set; }
        public int Quantity { get; set; }

        public string Unit { get; set; }     // אופציונלי
        public string ImageUrl { get; set; } // אופציונלי
    }
}
