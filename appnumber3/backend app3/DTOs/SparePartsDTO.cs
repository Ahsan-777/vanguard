namespace backend_app3.DTOs
{
    public class SparePartResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        
        // NEW FIELD ADDED HERE
        public int SoldQuantity { get; set; }

        public string? CompatibleModels { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsSoldOut { get; set; }
    }

    public class CreateSparePartDto
    {
        public string Name { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public string? CompatibleModels { get; set; }
        public string? ImageUrl { get; set; }
    }
}