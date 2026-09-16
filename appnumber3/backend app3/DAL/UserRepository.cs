using backend_app3.Data;
using backend_app3.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_app3.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var cleanUsername = username.Trim().ToLower();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username.ToLower() == cleanUsername);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            var cleanEmail = email.Trim().ToLower();
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == cleanEmail);
        }

        public async Task<bool> UserExistsAsync(string username)
        {
            var cleanUsername = username.Trim().ToLower();
            return await _context.Users
                .AnyAsync(u => u.Username.ToLower() == cleanUsername);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public void Update(User user)
        {
            _context.Users.Update(user);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}