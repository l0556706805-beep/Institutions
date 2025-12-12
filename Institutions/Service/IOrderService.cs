using System.Collections.Generic;
using System.Threading.Tasks;
using EducationOrdersAPI.DTOs;

namespace EducationOrdersAPI.Service
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(CreateOrderRequest req);
        Task<OrderDto> GetOrderByIdAsync(int id);
        Task<List<OrderDto>> GetOrdersAsync(int? institutionId);
        Task<List<OrderDto>> GetOrdersByUserAsync(int userId);
        //Task<bool> ApproveOrderAsync(int id, int approverId);
        Task<OrderDto> RepeatOrderAsync(int orderId, int newUserId);

        // חדש – מתאים למימוש שלך
        Task<bool> UpdateOrderStatusAsync(int id, string newStatus);
    }
}
