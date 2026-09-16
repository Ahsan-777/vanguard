// using backend_app3.Models;

// namespace backend_app3.Repositories
// {
//     public interface IUserRepository
//     {
//         Task<User?> GetByUsernameAsync(string username);
//         Task<bool> UserExistsAsync(string username);
//         Task AddAsync(User user);
//         void Update(User user);
//         Task SaveChangesAsync();
//     }
// }
using backend_app3.Models;

namespace backend_app3.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email); // <-- Added
        Task<bool> UserExistsAsync(string username);
        Task AddAsync(User user);
        void Update(User user);
        Task SaveChangesAsync();
    }
}