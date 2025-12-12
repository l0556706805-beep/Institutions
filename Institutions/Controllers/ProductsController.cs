using System.IO;
using System.Linq;
using System.Threading.Tasks;
using EducationOrdersAPI.Data;
using EducationOrdersAPI.DTOs;
using EducationOrdersAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly InstitutionsContext _ctx;

        public ProductsController(InstitutionsContext ctx)
        {
            _ctx = ctx;
        }

        // ============================
        // GET: api/products
        // ============================
        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _ctx.Products
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Price,
                    p.Description,
                    p.Unit,
                    p.ImageUrl,
                    p.IsActive,
                    p.CategoryId,
                    CategoryName = p.Category.Name,
                    p.Stock
                }).ToListAsync();

            return Ok(products);
        }

        // ============================
        // GET: api/products/{id}
        // ============================
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var p = await _ctx.Products.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id);
            if (p == null) return NotFound();

            return Ok(new ProductDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                Unit = p.Unit,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                Stock = p.Stock
            });
        }

        // ============================
        // POST: api/products
        // ============================
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductDto dto)
        {
            var p = new Product
            {
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Unit = dto.Unit,
                ImageUrl = dto.ImageUrl,
                IsActive = dto.IsActive,
                Stock = dto.Stock
            };

            _ctx.Products.Add(p);
            await _ctx.SaveChangesAsync();

            dto.Id = p.Id;
            return CreatedAtAction(nameof(Get), new { id = p.Id }, dto);
        }

        // ============================
        // PUT: api/products/{id}
        // ============================
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductDto dto)
        {
            var p = await _ctx.Products.FindAsync(id);
            if (p == null) return NotFound();

            p.CategoryId = dto.CategoryId;
            p.Name = dto.Name;
            p.Description = dto.Description;
            p.Price = dto.Price;
            p.Unit = dto.Unit;
            p.ImageUrl = dto.ImageUrl;
            p.IsActive = dto.IsActive;
            p.Stock = dto.Stock;

            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // ============================
        // DELETE: api/products/{id}
        // ============================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var p = await _ctx.Products.FindAsync(id);
            if (p == null) return NotFound();

            p.IsActive = false;
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // ============================
        // PUT: api/products/{id}/stock
        // ============================
        [HttpPut("{id}/stock")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateStockRequest req)
        {
            var product = await _ctx.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.Stock = req.NewStock;
            await _ctx.SaveChangesAsync();

            return Ok(product);
        }

        // ============================
        // POST: api/products/upload-image
        // ============================
        [Authorize(Roles = "Admin")]
        [HttpPost("upload-images")]
        public async Task<IActionResult> UploadImages([FromForm] MultipleFileUploadDto model)
        {
            if (model.Files == null || model.Files.Count == 0)
                return BadRequest("לא נבחרו קבצים");

            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");
            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var uploadedUrls = new List<string>();

            foreach (var file in model.Files)
            {
                if (file.Length == 0) continue;

                var fileName = Path.GetRandomFileName() + Path.GetExtension(file.FileName);
                var path = Path.Combine(folder, fileName);

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                uploadedUrls.Add($"/images/{fileName}");
            }

            return Ok(new { urls = uploadedUrls });
        }


        // ============================
        // DTOs
        // ============================
        public class UpdateStockRequest
        {
            public int NewStock { get; set; }
        }

        public class FileUploadDto
        {
            public IFormFile? File { get; set; }
        }

        public class MultipleFileUploadDto
        {
            public List<IFormFile>? Files { get; set; }
        }
    }
}