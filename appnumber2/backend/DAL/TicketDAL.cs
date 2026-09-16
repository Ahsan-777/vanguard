// using Microsoft.EntityFrameworkCore;
// using backend.Data;
// using backend.Models;
// using backend.DTO;
// using Microsoft.AspNetCore.Hosting;
// using Microsoft.AspNetCore.Http;
// using System.IO;

// namespace backend.DAL;

// public class TicketDAL
// {
//     private readonly AppDbContext _context;
//     private readonly IWebHostEnvironment _environment;

//     public TicketDAL(AppDbContext context, IWebHostEnvironment environment)
//     {
//         _context = context;
//         _environment = environment;
//     }

//     // =====================================================
//     // GET RECOMMENDED AGENT FOR COMPLEX TICKETS
//     // =====================================================
//     public string? GetRecommendedAgent()
//     {
//         // Find agent with the highest count of resolved/closed tickets
//         var topAgent = _context.Tickets
//             .Where(t => t.Status == TicketStatus.Closed.ToStatusString() && !string.IsNullOrEmpty(t.ResolvedBy))
//             .GroupBy(t => t.ResolvedBy)
//             .Select(g => new
//             {
//                 AgentUsername = g.Key,
//                 ResolvedCount = g.Count()
//             })
//             .OrderByDescending(a => a.ResolvedCount)
//             .FirstOrDefault();

//         return topAgent?.AgentUsername;
//     }

//     // =====================================================
//     // GET TICKETS (Updated with Recommendation & Image Fields)
//     // =====================================================
//     public List<object> GetTickets(string username, string role)
//     {
//         DateTime fourDaysAgo = DateTime.UtcNow.AddDays(-4);
//         string closedStatus = TicketStatus.Closed.ToStatusString();

//         IQueryable<Ticket> query = _context.Tickets;

//         if (role == "Admin")
//         {
//             query = query.Where(t => t.Status != closedStatus || t.UpdatedAt >= fourDaysAgo);
//         }
//         else if (role == "Agent")
//         {
//             query = query.Where(t => 
//                 (t.AssignedTo == username || t.ResolvedBy == username) &&
//                 (t.Status != closedStatus || t.UpdatedAt >= fourDaysAgo));
//         }
//         else
//         {
//             query = query.Where(t => t.CreatedBy == username);
//         }

//         // Fetch top agent username for recommendation logic
//         string? bestAgent = GetRecommendedAgent();

//         return query
//             .OrderByDescending(t => t.CreatedAt)
//             .Select(t => new
//             {
//                 id = t.Id,
//                 ticketNumber = t.TicketNumber,
//                 title = t.Title,
//                 description = t.Description,
//                 status = t.Status,
//                 complexity = t.Complexity,
//                 createdBy = t.CreatedBy,
//                 createdAt = t.CreatedAt,
//                 assignedTo = t.AssignedTo,
//                 resolvedBy = t.ResolvedBy,
//                 updatedAt = t.UpdatedAt,
//                 inProgressAt = t.InProgressAt,
//                 isOverdue = t.IsOverdue,
//                 imagePath = t.ImagePath,
//                 imageData = t.ImageData,
//                 imageStorageType = t.ImageStorageType,
//                 // Only recommend agent for Admin if ticket is "Complex" or "High"
//                 recommendedAgent = (t.Complexity == "Complex" || t.Complexity == "High") ? bestAgent : null
//             })
//             .Cast<object>()
//             .ToList();
//     }

//     // =====================================================
//     // CREATE TICKET
//     // =====================================================
//     public string CreateTicket(CreateTicketRequest request, string username)
//     {
//         try
//         {
//             string ticketNumber = "T-" + DateTime.UtcNow.ToString("yyMMddHHmmss");
//             string? imagePath = null;
//             string? imageData = null;

//             if (request.ImageFile != null && request.ImageFile.Length > 0)
//             {
//                 if (request.StorageType == "Disk")
//                 {
//                     string uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
//                     if (!Directory.Exists(uploadsFolder))
//                     {
//                         Directory.CreateDirectory(uploadsFolder);
//                     }

//                     string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.ImageFile.FileName);
//                     string filePath = Path.Combine(uploadsFolder, uniqueFileName);

//                     using (var stream = new FileStream(filePath, FileMode.Create))
//                     {
//                         request.ImageFile.CopyTo(stream);
//                     }

//                     imagePath = "/uploads/" + uniqueFileName;
//                 }
//                 else if (request.StorageType == "Database")
//                 {
//                     using (var memoryStream = new MemoryStream())
//                     {
//                         request.ImageFile.CopyTo(memoryStream);
//                         byte[] fileBytes = memoryStream.ToArray();
//                         imageData = $"data:{request.ImageFile.ContentType};base64," + Convert.ToBase64String(fileBytes);
//                     }
//                 }
//             }

//             var ticket = new Ticket
//             {
//                 TicketNumber = ticketNumber,
//                 Title = request.Title,
//                 Description = request.Description,
//                 Status = TicketStatus.New.ToStatusString(),
//                 CreatedBy = username,
//                 CreatedAt = DateTime.UtcNow,
//                 UpdatedAt = DateTime.UtcNow,
//                 Complexity = request.Complexity ?? "Low",
//                 ImagePath = imagePath,
//                 ImageData = imageData,
//                 ImageStorageType = request.ImageFile != null ? request.StorageType : null
//             };

//             _context.Tickets.Add(ticket);
//             _context.SaveChanges();

//             return ticketNumber;
//         }
//         catch (DbUpdateException ex)
//         {
//             var innerException = ex.InnerException?.Message ?? ex.Message;
//             Console.WriteLine($"[Database Save Error]: {innerException}");
//             throw new Exception($"Database constraint error: {innerException}");
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine($"[CreateTicket Error]: {ex.Message}");
//             throw;
//         }
//     }

//     // =====================================================
//     // ASSIGN TICKET
//     // =====================================================
//     public string? AssignTicket(int id, string agentUsername)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return null;
//         if (ticket.Status != TicketStatus.New.ToStatusString()) return "INVALID_STATUS";

//         ticket.AssignedTo = agentUsername;
//         ticket.Status = TicketStatus.Waiting.ToStatusString();
//         ticket.UpdatedAt = DateTime.UtcNow;

//         _context.SaveChanges();
//         return "SUCCESS";
//     }

//     // =====================================================
//     // CLAIM TICKET
//     // =====================================================
//     public string ClaimTicket(int id, string username)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return "NOT_FOUND";
//         if (!string.IsNullOrWhiteSpace(ticket.AssignedTo)) return "ALREADY_CLAIMED";
//         if (ticket.Status != TicketStatus.New.ToStatusString()) return "INVALID_STATUS";

//         ticket.AssignedTo = username;
//         ticket.Status = TicketStatus.Waiting.ToStatusString();
//         ticket.UpdatedAt = DateTime.UtcNow;

//         int rows = _context.SaveChanges();
//         return rows > 0 ? "SUCCESS" : "FAILED";
//     }

//     // =====================================================
//     // REASSIGN TICKET
//     // =====================================================
//     public string ReassignTicket(int id, string newAgentUsername)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return "NOT_FOUND";
//         if (ticket.Status == TicketStatus.Closed.ToStatusString()) return "CLOSED";

//         ticket.AssignedTo = newAgentUsername;
//         ticket.Status = TicketStatus.Waiting.ToStatusString();
//         ticket.UpdatedAt = DateTime.UtcNow;

//         _context.SaveChanges();
//         return "SUCCESS";
//     }

//     // =====================================================
//     // ACKNOWLEDGE TICKET
//     // =====================================================
//     public string AcknowledgeTicket(int id, string username)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return "NOT_FOUND";
//         if (ticket.Status != TicketStatus.Waiting.ToStatusString()) return "INVALID_STATUS";
//         if (!string.Equals(ticket.AssignedTo, username, StringComparison.OrdinalIgnoreCase)) return "NOT_ASSIGNED";

//         ticket.Status = TicketStatus.InProgress.ToStatusString();
//         ticket.InProgressAt = DateTime.UtcNow;
//         ticket.UpdatedAt = DateTime.UtcNow;

//         _context.SaveChanges();
//         return "SUCCESS";
//     }

//     // =====================================================
//     // RESOLVE TICKET
//     // =====================================================
//     public string ResolveTicket(int id, string username)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return "NOT_FOUND";
//         if (ticket.Status != TicketStatus.InProgress.ToStatusString()) return "INVALID_STATUS";
//         if (!string.Equals(ticket.AssignedTo, username, StringComparison.OrdinalIgnoreCase)) return "NOT_ASSIGNED";

//         ticket.Status = TicketStatus.Closed.ToStatusString();
//         ticket.ResolvedBy = username;
//         ticket.UpdatedAt = DateTime.UtcNow;

//         if (ticket.InProgressAt.HasValue && (DateTime.UtcNow - ticket.InProgressAt.Value).TotalMinutes > 2)
//         {
//             ticket.IsOverdue = true;
//         }

//         _context.SaveChanges();
//         return "SUCCESS";
//     }

//     // =====================================================
//     // REJECT / DELETE TICKET
//     // =====================================================
//     public string RejectTicket(int id)
//     {
//         var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
//         if (ticket == null) return "NOT_FOUND";

//         var messages = _context.TicketMessages.Where(m => m.TicketId == id);
//         _context.TicketMessages.RemoveRange(messages);

//         _context.Tickets.Remove(ticket);
//         int rows = _context.SaveChanges();

//         return rows > 0 ? "SUCCESS" : "FAILED";
//     }
// }
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System.IO;

namespace backend.DAL;

public class TicketDAL
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public TicketDAL(AppDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    // =====================================================
    // GET RECOMMENDED AGENT BASED ON COMPLEXITY
    // =====================================================
    public string? GetRecommendedAgent(string? complexity)
    {
        // 1. Fetch all active Agent usernames from the database
        var agentUsernames = _context.Users
            .Where(u => u.Role == "Agent")
            .Select(u => u.Username)
            .ToList();

        if (!agentUsernames.Any()) return null;

        // 2. Fetch resolution counts for agents from closed tickets
        var agentStats = _context.Tickets
            .Where(t => t.Status == TicketStatus.Closed.ToStatusString() 
                     && !string.IsNullOrWhiteSpace(t.ResolvedBy))
            .GroupBy(t => t.ResolvedBy)
            .Select(g => new
            {
                Username = g.Key,
                Count = g.Count()
            })
            .ToList();

        // 3. Map count for every active agent (Default to 0 if they haven't resolved any yet)
        var agentResolutionList = agentUsernames.Select(username => new
        {
            Username = username,
            ResolvedCount = agentStats.FirstOrDefault(s => s.Username == username)?.Count ?? 0
        }).ToList();

        bool isHighComplexity = !string.IsNullOrEmpty(complexity) && 
            (complexity.Equals("Complex", StringComparison.OrdinalIgnoreCase) || 
             complexity.Equals("High", StringComparison.OrdinalIgnoreCase));

        if (isHighComplexity)
        {
            // 🏆 High / Complex: Recommend Experienced Agent (Highest Resolved Count)
            return agentResolutionList
                .OrderByDescending(a => a.ResolvedCount)
                .FirstOrDefault()?.Username;
        }
        else
        {
            // 🌱 Low / Medium: Recommend New / Weak Agent (Lowest Resolved Count for Practice)
            return agentResolutionList
                .OrderBy(a => a.ResolvedCount)
                .FirstOrDefault()?.Username;
        }
    }

    // =====================================================
    // GET TICKETS (Updated with Dynamic Complexity Recommendation)
    // =====================================================
    public List<object> GetTickets(string username, string role)
    {
        DateTime fourDaysAgo = DateTime.UtcNow.AddDays(-4);
        string closedStatus = TicketStatus.Closed.ToStatusString();

        IQueryable<Ticket> query = _context.Tickets;

        if (role == "Admin")
        {
            query = query.Where(t => t.Status != closedStatus || t.UpdatedAt >= fourDaysAgo);
        }
        else if (role == "Agent")
        {
            query = query.Where(t => 
                (t.AssignedTo == username || t.ResolvedBy == username) &&
                (t.Status != closedStatus || t.UpdatedAt >= fourDaysAgo));
        }
        else
        {
            query = query.Where(t => t.CreatedBy == username);
        }

        // Fetch tickets from database first
        var rawTickets = query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                id = t.Id,
                ticketNumber = t.TicketNumber,
                title = t.Title,
                description = t.Description,
                status = t.Status,
                complexity = t.Complexity,
                createdBy = t.CreatedBy,
                createdAt = t.CreatedAt,
                assignedTo = t.AssignedTo,
                resolvedBy = t.ResolvedBy,
                updatedAt = t.UpdatedAt,
                inProgressAt = t.InProgressAt,
                isOverdue = t.IsOverdue,
                imagePath = t.ImagePath,
                imageData = t.ImageData,
                imageStorageType = t.ImageStorageType
            })
            .ToList();

        // Map recommendations dynamically in-memory based on complexity
        return rawTickets.Select(t => new
        {
            t.id,
            t.ticketNumber,
            t.title,
            t.description,
            t.status,
            t.complexity,
            t.createdBy,
            t.createdAt,
            t.assignedTo,
            t.resolvedBy,
            t.updatedAt,
            t.inProgressAt,
            t.isOverdue,
            t.imagePath,
            t.imageData,
            t.imageStorageType,
            
            // Dynamic Recommendation based on Complexity
            recommendedAgent = GetRecommendedAgent(t.complexity)
        })
        .Cast<object>()
        .ToList();
    }

    // =====================================================
    // CREATE TICKET
    // =====================================================
    public string CreateTicket(CreateTicketRequest request, string username)
    {
        try
        {
            string ticketNumber = "T-" + DateTime.UtcNow.ToString("yyMMddHHmmss");
            string? imagePath = null;
            string? imageData = null;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                if (request.StorageType == "Disk")
                {
                    string uploadsFolder = Path.Combine(_environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(request.ImageFile.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        request.ImageFile.CopyTo(stream);
                    }

                    imagePath = "/uploads/" + uniqueFileName;
                }
                else if (request.StorageType == "Database")
                {
                    using (var memoryStream = new MemoryStream())
                    {
                        request.ImageFile.CopyTo(memoryStream);
                        byte[] fileBytes = memoryStream.ToArray();
                        imageData = $"data:{request.ImageFile.ContentType};base64," + Convert.ToBase64String(fileBytes);
                    }
                }
            }

            var ticket = new Ticket
            {
                TicketNumber = ticketNumber,
                Title = request.Title,
                Description = request.Description,
                Status = TicketStatus.New.ToStatusString(),
                CreatedBy = username,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Complexity = request.Complexity ?? "Low",
                ImagePath = imagePath,
                ImageData = imageData,
                ImageStorageType = request.ImageFile != null ? request.StorageType : null
            };

            _context.Tickets.Add(ticket);
            _context.SaveChanges();

            return ticketNumber;
        }
        catch (DbUpdateException ex)
        {
            var innerException = ex.InnerException?.Message ?? ex.Message;
            Console.WriteLine($"[Database Save Error]: {innerException}");
            throw new Exception($"Database constraint error: {innerException}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CreateTicket Error]: {ex.Message}");
            throw;
        }
    }

    // =====================================================
    // ASSIGN TICKET
    // =====================================================
    public string? AssignTicket(int id, string agentUsername)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return null;
        if (ticket.Status != TicketStatus.New.ToStatusString()) return "INVALID_STATUS";

        ticket.AssignedTo = agentUsername;
        ticket.Status = TicketStatus.Waiting.ToStatusString();
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.SaveChanges();
        return "SUCCESS";
    }

    // =====================================================
    // CLAIM TICKET
    // =====================================================
    public string ClaimTicket(int id, string username)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return "NOT_FOUND";
        if (!string.IsNullOrWhiteSpace(ticket.AssignedTo)) return "ALREADY_CLAIMED";
        if (ticket.Status != TicketStatus.New.ToStatusString()) return "INVALID_STATUS";

        ticket.AssignedTo = username;
        ticket.Status = TicketStatus.Waiting.ToStatusString();
        ticket.UpdatedAt = DateTime.UtcNow;

        int rows = _context.SaveChanges();
        return rows > 0 ? "SUCCESS" : "FAILED";
    }

    // =====================================================
    // REASSIGN TICKET
    // =====================================================
    public string ReassignTicket(int id, string newAgentUsername)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return "NOT_FOUND";
        if (ticket.Status == TicketStatus.Closed.ToStatusString()) return "CLOSED";

        ticket.AssignedTo = newAgentUsername;
        ticket.Status = TicketStatus.Waiting.ToStatusString();
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.SaveChanges();
        return "SUCCESS";
    }

    // =====================================================
    // ACKNOWLEDGE TICKET
    // =====================================================
    public string AcknowledgeTicket(int id, string username)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return "NOT_FOUND";
        if (ticket.Status != TicketStatus.Waiting.ToStatusString()) return "INVALID_STATUS";
        if (!string.Equals(ticket.AssignedTo, username, StringComparison.OrdinalIgnoreCase)) return "NOT_ASSIGNED";

        ticket.Status = TicketStatus.InProgress.ToStatusString();
        ticket.InProgressAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.SaveChanges();
        return "SUCCESS";
    }

    // =====================================================
    // RESOLVE TICKET
    // =====================================================
    public string ResolveTicket(int id, string username)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return "NOT_FOUND";
        if (ticket.Status != TicketStatus.InProgress.ToStatusString()) return "INVALID_STATUS";
        if (!string.Equals(ticket.AssignedTo, username, StringComparison.OrdinalIgnoreCase)) return "NOT_ASSIGNED";

        ticket.Status = TicketStatus.Closed.ToStatusString();
        ticket.ResolvedBy = username;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (ticket.InProgressAt.HasValue && (DateTime.UtcNow - ticket.InProgressAt.Value).TotalMinutes > 2)
        {
            ticket.IsOverdue = true;
        }

        _context.SaveChanges();
        return "SUCCESS";
    }

    // =====================================================
    // REJECT / DELETE TICKET
    // =====================================================
    public string RejectTicket(int id)
    {
        var ticket = _context.Tickets.FirstOrDefault(t => t.Id == id);
        if (ticket == null) return "NOT_FOUND";

        var messages = _context.TicketMessages.Where(m => m.TicketId == id);
        _context.TicketMessages.RemoveRange(messages);

        _context.Tickets.Remove(ticket);
        int rows = _context.SaveChanges();

        return rows > 0 ? "SUCCESS" : "FAILED";
    }
}