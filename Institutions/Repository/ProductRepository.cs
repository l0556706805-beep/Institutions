using EducationOrdersAPI.Data;
using EducationOrdersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Repository
{
    public class ProductRepository:IProductRepository
    {
        private readonly InstitutionsContext _context;

        public ProductRepository(InstitutionsContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            return await _context.Products.ToListAsync();
        }

        public async Task<Product> GetAsync(int id)
        {
            return await _context.Products.FindAsync(id);
        }

        public async Task AddAsync(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
        }
    }
}
