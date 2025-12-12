using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.DTOs;
using EducationOrdersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Service
{
    public class OrderService : IOrderService
    {
        private readonly InstitutionsContext _ctx;

        public OrderService(InstitutionsContext ctx)
        {
            _ctx = ctx;
        }

        // --------------------------
        // CREATE ORDER
        // --------------------------
        public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest req)
        {
            if (req.Items == null || !req.Items.Any())
                throw new ArgumentException("Order must contain items");

            var productIds = req.Items.Select(i => i.ProductId).ToList();
            var products = await _ctx.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            if (products.Count != productIds.Count)
                throw new ArgumentException("One or more products not found");

            // Check stock
            foreach (var item in req.Items)
            {
                var p = products.First(x => x.Id == item.ProductId);
                if (p.Stock != null && item.Quantity > p.Stock)
                    throw new ArgumentException($"Not enough stock for '{p.Name}'");
            }

            // Create order
            var order = new Order
            {
                InstitutionId = req.InstitutionId,
                UserId = req.UserId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                Items = new List<OrderItem>()
            };

            // Add items + reduce stock
            foreach (var item in req.Items)
            {
                var p = products.First(x => x.Id == item.ProductId);

                order.Items.Add(new OrderItem
                {
                    ProductId = p.Id,
                    Quantity = item.Quantity,
                    Price = p.Price
                });

                if (p.Stock != null)
                    p.Stock -= item.Quantity;

                order.TotalAmount += p.Price * item.Quantity;
            }

            _ctx.Orders.Add(order);
            await _ctx.SaveChangesAsync();

            return Convert(order);
        }

        // --------------------------
        // REPEAT ORDER
        // --------------------------
        public async Task<OrderDto> RepeatOrderAsync(int orderId, int newUserId)
        {
            var oldOrder = await _ctx.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (oldOrder == null)
                throw new ArgumentException("Order does not exist");

            var req = new CreateOrderRequest
            {
                InstitutionId = oldOrder.InstitutionId,
                UserId = newUserId,
                Items = oldOrder.Items.Select(i => new CreateOrderItemRequest
                {
                    ProductId = i.ProductId,
                    Quantity = i.Quantity
                }).ToList()
            };

            return await CreateOrderAsync(req);
        }

        // --------------------------
        // GET ORDER BY ID
        // --------------------------
        public async Task<OrderDto> GetOrderByIdAsync(int id)
        {
            var o = await _ctx.Orders
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Include(o => o.User)
                .Include(o => o.Institution)
                .FirstOrDefaultAsync(o => o.Id == id);

            return o == null ? null : Convert(o);
        }

        // --------------------------
        // GET ALL ORDERS
        // --------------------------
        public async Task<List<OrderDto>> GetOrdersAsync(int? institutionId)
        {
            var query = _ctx.Orders
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Include(o => o.User)
                .Include(o => o.Institution)
                .AsQueryable();

            if (institutionId != null)
                query = query.Where(o => o.InstitutionId == institutionId);

            var list = await query.ToListAsync();
            return list.Select(Convert).ToList();
        }

        // --------------------------
        // GET USER ORDERS
        // --------------------------
        public async Task<List<OrderDto>> GetOrdersByUserAsync(int userId)
        {
            var list = await _ctx.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .Include(o => o.Institution)
                .Include(o => o.User)
                .ToListAsync();

            return list.Select(Convert).ToList();
        }

        // --------------------------
        // UPDATE ORDER STATUS
        // --------------------------
        public async Task<bool> UpdateOrderStatusAsync(int id, string newStatus)
        {
            var o = await _ctx.Orders.FindAsync(id);
            if (o == null) return false;

            o.Status = newStatus;
            await _ctx.SaveChangesAsync();
            return true;
        }

        // --------------------------
        // Helper
        // --------------------------
        private OrderDto Convert(Order o)
        {
            return new OrderDto
            {
                Id = o.Id,
                InstitutionId = o.InstitutionId,
                InstitutionName = o.Institution?.Name,
                UserId = o.UserId,
                UserFullName = o.User?.FullName,
                CreatedAt = o.CreatedAt,
                Status = o.Status,
                TotalAmount = o.TotalAmount,

                Items = o.Items?.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    Unit = i.Product?.Unit,
                    ImageUrl = i.Product?.ImageUrl
                }).ToList() ?? new List<OrderItemDto>()
            };
        }
    }
}
