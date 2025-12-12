using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using EducationOrdersAPI.Service;
using EducationOrdersAPI.DTOs;

namespace EducationOrdersAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // ----------------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _orderService.CreateOrderAsync(req);
            return Ok(result);
        }

        // ----------------------------------------------------
        // GET ORDER BY ID
        // ----------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
                return NotFound();

            return Ok(order);
        }

        // ----------------------------------------------------
        // GET ORDERS (OPTIONAL institutionId)
        // /api/order?institutionId=5
        // ----------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] int? institutionId)
        {
            var list = await _orderService.GetOrdersAsync(institutionId);
            return Ok(list);
        }

        // ----------------------------------------------------
        // GET ORDERS BY USER
        // /api/order/user/7
        // ----------------------------------------------------
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetOrdersByUser(int userId)
        {
            var list = await _orderService.GetOrdersByUserAsync(userId);
            return Ok(list);
        }

        //// ----------------------------------------------------
        //// APPROVE ORDER
        //// /api/order/approve/10?approverId=5
        //// ----------------------------------------------------
        //[HttpPost("approve/{id}")]
        //public async Task<IActionResult> Approve(int id, [FromQuery] int approverId)
        //{
        //    var ok = await _orderService.ApproveOrderAsync(id, approverId);
        //    if (!ok)
        //        return BadRequest("Unable to approve order");

        //    return Ok(new { success = true });
        //}

        // ----------------------------------------------------
        // REPEAT ORDER
        // /api/order/repeat/10?newUserId=7
        // ----------------------------------------------------
        [HttpPost("repeat/{orderId}")]
        public async Task<IActionResult> Repeat(int orderId, [FromQuery] int newUserId)
        {
            var dto = await _orderService.RepeatOrderAsync(orderId, newUserId);
            return Ok(dto);
        }

        // ----------------------------------------------------
        // UPDATE STATUS
        // /api/order/5/status
        // body: { "newStatus": "Approved" }
        // ----------------------------------------------------
        public class UpdateStatusRequest
        {
            public string NewStatus { get; set; }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest req)
        {
            if (req?.NewStatus == null)
                return BadRequest("Status required");

            var ok = await _orderService.UpdateOrderStatusAsync(id, req.NewStatus);
            if (!ok)
                return NotFound();

            return Ok(new { success = true });
        }
    }
}
