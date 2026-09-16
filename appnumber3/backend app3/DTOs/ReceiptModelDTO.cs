namespace backend_app3.DTOs
{
    public class ReceiptModel
    {
        public int ReceiptId { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty; // "SparePart" or "Car"
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount => Quantity * UnitPrice;
    }
}