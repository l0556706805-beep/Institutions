using EducationOrdersAPI.Data;
using EducationOrdersAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace EducationOrdersAPI.Repository
{
    public class UserRepository:IUserRepository
    {
        private readonly InstitutionsContext _db;
        public UserRepository(InstitutionsContext db) { _db = db; }

        public async Task<User?> GetByEmailAsync(string email) =>
            await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        public async Task<User?> GetByIdAsync(int id) =>
            await _db.Users.FindAsync(id);

        public async Task AddAsync(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }
    }
}
