namespace backend_app3.Models
{
    public class SaleRecord
    {
        public int Id { get; set; }
        public string ItemType { get; set; } = "SparePart";
        
        // Matches "ItemId" column in MySQL
        public int ItemId { get; set; }
        public string ProductName { get; set; } = string.Empty;        public int Quantity { get; set; }
        
        // Matches "TotalAmount" column in MySQL
        public decimal TotalAmount { get; set; }
        
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public DateTime SaleDate { get; set; } = DateTime.UtcNow;
    }
}