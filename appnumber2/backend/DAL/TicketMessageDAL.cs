using backend.Data;
using backend.Models;

namespace backend.DAL;

public class TicketMessageDAL
{
    private readonly AppDbContext _context;

    public TicketMessageDAL(AppDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // GET MESSAGES
    // =====================================================
    public List<object> GetMessages(int ticketId)
    {
        return _context.TicketMessages
            .Where(m => m.TicketId == ticketId)
            .OrderBy(m => m.CreatedAt)
            .AsEnumerable() // EF Core Query Execution Done Here
            .Select(m => (object)new
            {
                id = m.Id,
                ticketId = m.TicketId,
                senderUsername = m.SenderUsername,
                senderRole = m.SenderRole,
                message = m.Message,
                createdAt = m.CreatedAt
            })
            .ToList();
    }

    // =====================================================
    // GET TICKET MESSAGE INFO
    // =====================================================
    public (bool Found, string CreatedBy, string AssignedTo, string Status) GetTicketMessageInfo(int ticketId)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == ticketId);

        if (ticket == null)
        {
            return (false, "", "", "");
        }

        return (
            true,
            ticket.CreatedBy ?? "",
            ticket.AssignedTo ?? "",
            ticket.Status ?? ""
        );
    }

    // =====================================================
    // SEND MESSAGE
    // =====================================================
    public void SendMessage(int ticketId, string username, string role, string message)
    {
        var ticketMessage = new TicketMessage
        {
            TicketId = ticketId,
            SenderUsername = username,
            SenderRole = role,
            Message = message,
            CreatedAt = DateTime.UtcNow
        };

        _context.TicketMessages.Add(ticketMessage);
        _context.SaveChanges();
    }
}