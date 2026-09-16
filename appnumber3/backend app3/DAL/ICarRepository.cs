using backend_app3.Models;

namespace backend_app3.Repositories
{
    public interface ICarRepository
    {
        Task<IEnumerable<Car>> GetCarsAsync(string? query);
        Task<Car?> GetByIdAsync(int id);
        Task AddAsync(Car car);
        Task SaveChangesAsync();
    }
}