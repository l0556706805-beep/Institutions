using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.DTOs;
using EducationOrdersAPI.Models;
using Microsoft.AspNetCore.Authorization;

using Microsoft.EntityFrameworkCore;
using System;

namespace EducationOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly InstitutionsContext _ctx;
        public CategoriesController(InstitutionsContext ctx) { _ctx = ctx; }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _ctx.Categories.Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Description = c.Description }).ToListAsync();
            return Ok(list);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryDto dto)
        {
            var c = new Category { Name = dto.Name, Description = dto.Description };
            _ctx.Categories.Add(c);
            await _ctx.SaveChangesAsync();
            dto.Id = c.Id;
            return CreatedAtAction(nameof(GetAll), new { id = c.Id }, dto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryDto dto)
        {
            var c = await _ctx.Categories.FindAsync(id);
            if (c == null) return NotFound();
            c.Name = dto.Name; c.Description = dto.Description;
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await _ctx.Categories.FindAsync(id);
            if (c == null) return NotFound();
            _ctx.Categories.Remove(c);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }
    }
}
