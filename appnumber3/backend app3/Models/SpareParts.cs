namespace backend_app3.Models
{
    public class SparePart
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string PartNumber { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int QuantityInStock { get; set; }
        public int SoldQuantity { get; set; } = 0;
        public string? CompatibleModels { get; set; }
        public string? ImageUrl { get; set; }

        // Computed property (not mapped to DB column)
        public bool IsSoldOut => QuantityInStock <= 0;
    }
}