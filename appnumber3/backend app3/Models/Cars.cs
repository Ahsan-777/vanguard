namespace backend_app3.Models
{
    public class Car
    {
        public int Id { get; set; }
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Price { get; set; }
        public int Mileage { get; set; }
        public string? Color { get; set; }
        public string? EngineSize { get; set; }
        public string? Transmission { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsSold { get; set; } = false;
        public string? Type { get; set; }
        public string? Condition { get; set; }
    }
}