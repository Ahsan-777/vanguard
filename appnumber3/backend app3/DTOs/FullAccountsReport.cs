namespace backend_app3.DTOs
{
    public class AccountSummaryDto
    {
        public decimal VehicleSalesRevenue { get; set; }
        public decimal PartsSalesRevenue { get; set; }
        public decimal TotalGrossRevenue => VehicleSalesRevenue + PartsSalesRevenue;
        
        public decimal VehicleInventoryValuation { get; set; }
        public decimal PartsInventoryValuation { get; set; }
        public decimal TotalAssetValuation => VehicleInventoryValuation + PartsInventoryValuation;

        public int TotalVehiclesSold { get; set; }
        public int TotalPartsSold { get; set; }
    }

    public class RecentTransactionDto
    {
        public DateTime Date { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "Vehicle Sale" or "Parts Sale"
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class FullAccountsReportDto
    {
        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;
        public AccountSummaryDto Summary { get; set; } = new();
        public List<RecentTransactionDto> RecentTransactions { get; set; } = new();
    }
}