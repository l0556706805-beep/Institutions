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
    public class UsersController : ControllerBase
    {
        private readonly InstitutionsContext _ctx;
        public UsersController(InstitutionsContext ctx) { _ctx = ctx; }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _ctx.Users.Select(u => new UserDto { Id = u.Id, InstitutionId = u.InstitutionId, FullName = u.FullName, Email = u.Email, Role = u.Role }).ToListAsync();
            return Ok(list);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var uid = User.FindFirst("id")?.Value;
            if (!int.TryParse(uid, out var id)) return Unauthorized();
            var u = await _ctx.Users.FindAsync(id);
            if (u == null) return NotFound();
            return Ok(new UserDto { Id = u.Id, InstitutionId = u.InstitutionId, FullName = u.FullName, Email = u.Email, Role = u.Role });
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserDto dto)
        {
            var user = new User
            {
                InstitutionId = dto.InstitutionId,
                FullName = dto.FullName,
                Email = dto.Email,
                Role = dto.Role,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password) // דוגמה ל־hash
            };

            _ctx.Users.Add(user);
            await _ctx.SaveChangesAsync();

            var userDto = new UserDto
            {
                Id = user.Id,
                InstitutionId = user.InstitutionId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            };

            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, userDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.InstitutionId = dto.InstitutionId;

            if (!string.IsNullOrEmpty(dto.Password))
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            await _ctx.SaveChangesAsync();

            return Ok(new UserDto
            {
                Id = user.Id,
                InstitutionId = user.InstitutionId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _ctx.Users.FindAsync(id);
            if (user == null) return NotFound();

            _ctx.Users.Remove(user);
            await _ctx.SaveChangesAsync();

            return NoContent();
        }



    }
}
