using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTO;
namespace backend.DAL;

public class TicketStatsDAL
{
    private readonly AppDbContext _context;

    public TicketStatsDAL(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // AGENT STATS
    // =====================================================
    public object GetAgentStats(string username)
    {
        var query = _context.Tickets.Where(t => t.AssignedTo == username || t.ResolvedBy == username);

        int totalAssigned = query.Count();
        int resolved = query.Count(t => t.Status == "Closed" && t.ResolvedBy == username);
        int pending = query.Count(t => t.AssignedTo == username && t.Status != "Closed");

        return new
        {
            totalAssigned,
            resolved,
            pending
        };
    }
// USER KPI STATS (Breakdown by Assigned User)
    public List<UserKpiDto> GetUserKpiStats()
    {
        // Fetch all tickets to calculate status breakdown in memory
        var tickets = _context.Tickets.ToList();

        // Get list of distinct assigned agents / users
        var userGroup = tickets
            .Where(t => !string.IsNullOrEmpty(t.AssignedTo))
            .GroupBy(t => t.AssignedTo!)
            .Select(g => new UserKpiDto
            {
                Username = g.Key,
                
                // 3. Active Tickets (Currently In Progress)
                ActiveTickets = g.Count(t => t.Status == "In Progress"),

                // 5. Pending / Waiting Tickets
                PendingTickets = g.Count(t => t.Status == "Waiting"),

                // 4. Total Closed Tickets
                ClosedTickets = g.Count(t => t.Status == "Closed"),

                // 1. Resolved within SLA limit (Resolved and NOT overdue)
                ResolvedWithinTime = g.Count(t => t.Status == "Closed" && !t.IsOverdue),

                // 1. Resolved after SLA limit (Resolved but marked overdue)
                ResolvedAfterTime = g.Count(t => t.Status == "Closed" && t.IsOverdue),

                // 2. Total Overdue Tickets (Both active overdue and closed overdue)
                TotalOverdue = g.Count(t => 
                    t.IsOverdue || 
                    (t.Status == "In Progress" && t.InProgressAt.HasValue && (DateTime.UtcNow - t.InProgressAt.Value).TotalMinutes > 2)
                )
            })
            .ToList();

        return userGroup;
    }
}