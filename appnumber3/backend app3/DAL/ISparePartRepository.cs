using backend_app3.Models;

namespace backend_app3.Repositories
{
    public interface ISparePartRepository
    {
        Task<SparePart?> GetByIdAsync(int id);
        Task<IEnumerable<SparePart>> GetPartsAsync(string? query);
        Task<SaleRecord?> GetSaleRecordByIdAsync(int saleId); // Added for receipt lookup
        Task AddAsync(SparePart part);
        Task AddSaleRecordAsync(SaleRecord sale);
        Task SaveChangesAsync();
    }
}