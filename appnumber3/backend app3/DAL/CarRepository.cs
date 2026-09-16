using backend_app3.Data;
using backend_app3.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_app3.Repositories
{
    public class CarRepository : ICarRepository
    {
        private readonly AppDbContext _context;

        public CarRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Car>> GetCarsAsync(string? query)
        {
            var carsQuery = _context.Cars.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var cleanQuery = query.Trim().ToLower();

                carsQuery = carsQuery.Where(c =>
                    (c.Make != null && c.Make.ToLower().Contains(cleanQuery)) ||
                    (c.Model != null && c.Model.ToLower().Contains(cleanQuery)) ||
                    c.Year.ToString().Contains(cleanQuery)
                );
            }

            return await carsQuery.ToListAsync();
        }

        public async Task<Car?> GetByIdAsync(int id)
        {
            return await _context.Cars.FindAsync(id);
        }

        public async Task AddAsync(Car car)
        {
            await _context.Cars.AddAsync(car);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
    
}