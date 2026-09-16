namespace backend.DTO;

public class UserKpiDto
{
    public string Username { get; set; } = string.Empty;
    public int ActiveTickets { get; set; }
    public int PendingTickets { get; set; }
    public int ClosedTickets { get; set; }
    public int ResolvedWithinTime { get; set; }
    public int ResolvedAfterTime { get; set; }
    public int TotalOverdue { get; set; }
}