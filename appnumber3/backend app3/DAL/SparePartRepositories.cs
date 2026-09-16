using backend_app3.Data;
using backend_app3.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_app3.Repositories
{
    public class SparePartRepository : ISparePartRepository
    {
        private readonly AppDbContext _context;

        public SparePartRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<SaleRecord?> GetSaleRecordByIdAsync(int saleId)
{
    return await _context.SalesRecords.FindAsync(saleId);
}

        public async Task<IEnumerable<SparePart>> GetPartsAsync(string? query)
        {
            var partsQuery = _context.SpareParts.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var cleanQuery = query.Trim();
                partsQuery = partsQuery.Where(p => 
                    EF.Functions.Like(p.Name, $"%{cleanQuery}%") || 
                    EF.Functions.Like(p.PartNumber, $"%{cleanQuery}%") || 
                    EF.Functions.Like(p.Category, $"%{cleanQuery}%"));
            }

            return await partsQuery.ToListAsync();
        }

        public async Task<SparePart?> GetByIdAsync(int id)
        {
            return await _context.SpareParts.FindAsync(id);
        }

        public async Task AddAsync(SparePart part)
        {
            await _context.SpareParts.AddAsync(part);
        }

        public async Task AddSaleRecordAsync(SaleRecord sale)
        {
            await _context.SalesRecords.AddAsync(sale);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}