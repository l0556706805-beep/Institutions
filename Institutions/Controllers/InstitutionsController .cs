using System;
using System.Linq;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.DTOs;
using EducationOrdersAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorization: Bearer {eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjUiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJsMDU1NjcwNjgwNUBnbWFpbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiQWRtaW4gTWFzdGVyIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NjMzMTk2NzcsImlzcyI6IkVkdWNhdGlvbk9yZGVyc0FQSSIsImF1ZCI6IkVkdWNhdGlvbk9yZGVyc0FQSSJ9.AAAYFArVAjPJSs5Y79sREL8K7ozvPUNZn2f1F9waBZ8}
    public class InstitutionsController : ControllerBase
    {
        private readonly InstitutionsContext _ctx;
        public InstitutionsController(InstitutionsContext ctx) { _ctx = ctx; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _ctx.Institutions
                .Select(i => new InstitutionDto
                {
                    Id = i.Id,
                    Name = i.Name ?? "",
                    Address = i.Address ?? "",
                    Phone = i.Phone ?? "",
                    ContactName = i.ContactName ?? ""
                })
                .ToListAsync();

            return Ok(list);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var inst = await _ctx.Institutions.FindAsync(id);
            if (inst == null) return NotFound();
            return Ok(new InstitutionDto { Id = inst.Id, Name = inst.Name, Address = inst.Address, Phone = inst.Phone, ContactName = inst.ContactName });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] InstitutionDto dto)
        {
            var inst = new Institution { Name = dto.Name, Address = dto.Address, Phone = dto.Phone, ContactName = dto.ContactName };
            _ctx.Institutions.Add(inst);
            await _ctx.SaveChangesAsync();
            dto.Id = inst.Id;
            return CreatedAtAction(nameof(Get), new { id = inst.Id }, dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] InstitutionDto dto)
        {
            var inst = await _ctx.Institutions.FindAsync(id);
            if (inst == null) return NotFound();
            inst.Name = dto.Name; inst.Address = dto.Address; inst.Phone = dto.Phone; inst.ContactName = dto.ContactName;
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var inst = await _ctx.Institutions.FindAsync(id);
            if (inst == null) return NotFound();
            _ctx.Institutions.Remove(inst);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("{id}/Users")]
        public async Task<IActionResult> GetUsersByInstitution(int id)
        {
            var users = await _ctx.Users
                .Where(u => u.InstitutionId == id)
                .ToListAsync();

            return Ok(users);
        }

    }
}
