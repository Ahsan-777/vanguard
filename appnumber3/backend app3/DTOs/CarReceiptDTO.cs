namespace backend_app3.DTOs
{
    public class CarReceiptDto
    {
        public int ReceiptId { get; set; }
        public DateTime SaleDate { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string VehicleName { get; set; } = string.Empty; // Make + Model
        public int Year { get; set; }
        public decimal Price { get; set; }
    }
}