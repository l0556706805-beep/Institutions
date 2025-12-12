using EducationOrdersAPI.Models;

namespace EducationOrdersAPI.Repository
{
    public interface IProductRepository
    {

        Task<List<Product>> GetAllAsync();
        Task<Product> GetAsync(int id);
        Task AddAsync(Product product);
    }
}
