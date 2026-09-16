namespace backend.DTO
{
    public class AuditTicketItemDto
    {
        public int TicketId { get; set; }
        public string Title { get; set; } = "N/A";
        public string CreatedBy { get; set; } = "N/A";
        public string AssignedTo { get; set; } = "Unassigned";
        public string Status { get; set; } = "N/A";

        // Status Timeline Timestamps
        public string TimeWaiting { get; set; } = "N/A";
        public string TimeInProgress { get; set; } = "N/A";
        public string TimeClosed { get; set; } = "N/A";

        // Conversation History
        public List<string> ChatMessages { get; set; } = new();
    }

    public class AuditReportDataDto
    {
        public string Title { get; set; } = "System-Wide Ticket Audit Report";
        public string HeaderColor { get; set; } = QuestPDF.Helpers.Colors.Purple.Darken2;
        public List<AuditTicketItemDto> Tickets { get; set; } = new();
    }

public class ReportDataDto
    {
        public string Title { get; set; } = "Report";
        public string HeaderColor { get; set; } = QuestPDF.Helpers.Colors.Purple.Darken2;
        public List<string> Headers { get; set; } = new();
        public List<List<string>> Rows { get; set; } = new();
    }
}