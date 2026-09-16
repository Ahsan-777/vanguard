namespace backend.Models;

public class Ticket
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "New"; 
    public string Complexity { get; set; } = "Low";
    public string? Priority { get; set; } = "Medium";
    public string? CreatedBy { get; set; }
    public string? AssignedTo { get; set; }
    public string? ResolvedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // 2-Minute SLA Timer Properties
    public DateTime? InProgressAt { get; set; }
    public bool IsOverdue { get; set; } = false;
    public string? ImagePath { get; set; }
    public string? ImageData { get; set; }
    public string? ImageStorageType { get; set; }
}