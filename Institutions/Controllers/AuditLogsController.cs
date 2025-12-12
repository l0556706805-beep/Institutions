using System;
using System.Linq;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditLogsController : ControllerBase
    {
        private readonly InstitutionsContext _ctx;
        public AuditLogsController(InstitutionsContext ctx) { _ctx = ctx; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs = await _ctx.AuditLogs
                .OrderByDescending(a => a.CreatedAt)
                .Take(500)
                .Select(a => new { a.Id, a.UserId, a.Action, a.Details, a.CreatedAt })
                .ToListAsync();
            return Ok(logs);
        }
    }
}
