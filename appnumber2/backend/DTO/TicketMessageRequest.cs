namespace backend.DTO;

public class TicketMessageRequest
{
    public int TicketId { get; set; }
    public string SenderUsername { get; set; } = "";
    public string SenderRole { get; set; } = "";
    public string Message { get; set; } = "";
}