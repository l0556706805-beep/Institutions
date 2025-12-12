using EducationOrdersAPI.Models;

namespace EducationOrdersAPI.Repository
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(int id);
        Task AddAsync(User user);
    }
}
