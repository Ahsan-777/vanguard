namespace backend.Models;

public enum TicketStatus
{
    New,
    Waiting,
    InProgress,
    Closed
}

public static class TicketStatusExtensions
{
    // Enum ko database/string format ("In Progress") me convert karne ke liye
    public static string ToStatusString(this TicketStatus status) => status switch
    {
        TicketStatus.InProgress => "In Progress",
        _ => status.ToString()
    };
}