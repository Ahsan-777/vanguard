namespace backend_app3.DTOs
{
    public class CarInventoryItemDto
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Price { get; set; }
        public string Condition { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsSold { get; set; }
    }

    public class CarInventoryReportDto
    {
        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
        public int TotalVehiclesCount { get; set; }
        public int TotalAvailableVehicles { get; set; }
        public int TotalSoldVehicles { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public decimal TotalSalesValue { get; set; }
        public List<CarInventoryItemDto> Items { get; set; } = new();
    }
}