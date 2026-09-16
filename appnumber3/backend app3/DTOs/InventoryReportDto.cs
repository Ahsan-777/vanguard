namespace backend_app3.DTOs
{
    public class InventoryItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public int SoldQuantity { get; set; }
        public decimal TotalStockValue => Price * QuantityInStock;
    }

    public class InventoryReportDto
    {
        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
        public int TotalPartsCount { get; set; }
        public int TotalAvailableParts { get; set; }
        public int TotalSoldParts { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public List<InventoryItemDto> Items { get; set; } = new();
    }
    
}