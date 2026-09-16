using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DAL;
using backend.DTO;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("Tickets")]
public class TicketController : ControllerBase
{
    private readonly TicketDAL _ticketDAL;
    private readonly TicketMessageDAL _ticketMessageDAL;
    private readonly TicketStatsDAL _ticketStatsDAL;

    public TicketController(
        TicketDAL ticketDAL,
        TicketMessageDAL ticketMessageDAL,
        TicketStatsDAL ticketStatsDAL)
    {
        _ticketDAL = ticketDAL;
        _ticketMessageDAL = ticketMessageDAL;
        _ticketStatsDAL = ticketStatsDAL;
    }

    private string GetUsername()
    {
        return User.FindFirst(ClaimTypes.Name)?.Value 
            ?? User.FindFirst("name")?.Value 
            ?? User.FindFirst("sub")?.Value 
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? User.Identity?.Name 
            ?? "";
    }

    private string GetRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value 
            ?? User.FindFirst("role")?.Value 
            ?? "";
    }

    [Authorize]
    [HttpGet]
    public IActionResult GetTickets()
    {
        try
        {
            string username = GetUsername();
            string role = GetRole();

            if (string.IsNullOrWhiteSpace(username))
                return Unauthorized();

            var tickets = _ticketDAL.GetTickets(username, role);
            return Ok(tickets);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching tickets", error = ex.Message });
        }
    }

    // [Authorize]
    // [HttpPost]
    // public IActionResult CreateTicket([FromForm] CreateTicketRequest request)
    // {
    //     try
    //     {
    //         if (request == null || string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
    //         {
    //             return BadRequest(new { message = "Title and Description are required" });
    //         }

    //         string username = GetUsername();
    //         if (string.IsNullOrWhiteSpace(username))
    //             return Unauthorized();

    //         string ticketNumber = _ticketDAL.CreateTicket(request, username);
    //         return Ok(new { message = "Ticket created successfully", ticketNumber });
    //     }
    //     catch (Exception ex)
    //     {
    //         return StatusCode(500, new { message = "Error creating ticket", error = ex.Message });
    //     }
    // }
[Authorize]
[HttpPost]
public IActionResult CreateTicket([FromForm] CreateTicketRequest request)
{
    try
    {
        // DEBUG LOGS (Backend Terminal me check karein)
        Console.WriteLine($"[DEBUG] Title: {request.Title}");
        Console.WriteLine($"[DEBUG] StorageType: {request.StorageType}");
        Console.WriteLine($"[DEBUG] ImageFile Null?: {request.ImageFile == null}");
        if (request.ImageFile != null)
        {
            Console.WriteLine($"[DEBUG] File Name: {request.ImageFile.FileName}");
            Console.WriteLine($"[DEBUG] File Length: {request.ImageFile.Length}");
        }

        if (request == null || string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Description))
        {
            return BadRequest(new { message = "Title and Description are required" });
        }

        string username = GetUsername();
        if (string.IsNullOrWhiteSpace(username))
            return Unauthorized();

        string ticketNumber = _ticketDAL.CreateTicket(request, username);
        return Ok(new { message = "Ticket created successfully", ticketNumber });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error creating ticket", error = ex.Message });
    }
}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/assign")]
    public IActionResult AssignTicket(int id, [FromBody] AssignTicketRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.AgentUsername))
                return BadRequest(new { message = "Agent username is required" });

            string? result = _ticketDAL.AssignTicket(id, request.AgentUsername);

            if (result == null) return NotFound(new { message = "Ticket not found" });
            if (result == "INVALID_STATUS") return BadRequest(new { message = "Only New tickets can be assigned" });

            return Ok(new { message = "Ticket assigned successfully", status = "Waiting" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error assigning ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Agent")]
    [HttpPut("{id}/acknowledge")]
    public IActionResult AcknowledgeTicket(int id)
    {
        try
        {
            string username = GetUsername();
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            string result = _ticketDAL.AcknowledgeTicket(id, username);

            if (result == "NOT_FOUND") return NotFound(new { message = "Ticket not found" });
            if (result == "INVALID_STATUS") return BadRequest(new { message = "Ticket is not waiting for acknowledgement" });
            if (result == "NOT_ASSIGNED") return Unauthorized(new { message = "You are not assigned to this ticket" });

            return Ok(new { message = "Ticket acknowledged", status = "In Progress" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error acknowledging ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Agent")]
    [HttpPost("{id}/claim")]
    public IActionResult ClaimTicket(int id)
    {
        try
        {
            string username = GetUsername();
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            string result = _ticketDAL.ClaimTicket(id, username);

            if (result == "NOT_FOUND") return NotFound(new { message = "Ticket not found" });
            if (result == "ALREADY_CLAIMED") return BadRequest(new { message = "Ticket has already been claimed" });
            if (result == "INVALID_STATUS") return BadRequest(new { message = "Only New tickets can be claimed" });

            return Ok(new { message = "Ticket claimed successfully", ticketId = id, assignedTo = username, status = "Waiting" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error claiming ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("{id}/reassign")]
    [HttpPut("{id}/reassign")]
    public IActionResult ReassignTicket(int id, [FromBody] ReassignTicketRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.NewAgentUsername))
                return BadRequest(new { message = "Agent username is required" });

            string result = _ticketDAL.ReassignTicket(id, request.NewAgentUsername);

            if (result == "NOT_FOUND") return NotFound(new { message = "Ticket not found" });
            if (result == "CLOSED") return BadRequest(new { message = "Closed tickets cannot be reassigned" });

            return Ok(new { message = "Ticket reassigned successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error reassigning ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Agent")]
    [HttpGet("agent-stats")]
    public IActionResult GetAgentStats()
    {
        try
        {
            string username = GetUsername();
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            var stats = _ticketStatsDAL.GetAgentStats(username);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching agent stats", error = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("{ticketId}/messages")]
    public IActionResult GetMessages(int ticketId)
    {
        try
        {
            var messages = _ticketMessageDAL.GetMessages(ticketId);
            return Ok(messages);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching messages", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("{ticketId}/messages")]
    public IActionResult SendMessage(int ticketId, [FromBody] TicketMessageRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest(new { message = "Message is required" });

            string username = GetUsername();
            string role = GetRole();
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            var ticket = _ticketMessageDAL.GetTicketMessageInfo(ticketId);
            if (!ticket.Found) return NotFound(new { message = "Ticket not found" });

            if (string.Equals(role, "User", StringComparison.OrdinalIgnoreCase) && !string.Equals(ticket.CreatedBy, username, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            if (string.Equals(role, "Agent", StringComparison.OrdinalIgnoreCase) && !string.Equals(ticket.AssignedTo, username, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            if (string.Equals(ticket.Status, "Closed", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Closed tickets cannot receive messages" });

            _ticketMessageDAL.SendMessage(ticketId, username, role, request.Message);
            return Ok(new { message = "Message sent successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error sending message", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}/reject")]
    public IActionResult RejectTicket(int id)
    {
        try
        {
            string result = _ticketDAL.RejectTicket(id);

            if (result == "NOT_FOUND") return NotFound(new { message = "Ticket not found" });

            return Ok(new { message = "Ticket rejected and deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error rejecting ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Agent")]
    [HttpPut("{id}/resolve")]
    public IActionResult ResolveTicket(int id)
    {
        try
        {
            string username = GetUsername();
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            string result = _ticketDAL.ResolveTicket(id, username);

            if (result == "NOT_FOUND") return NotFound(new { message = "Ticket not found" });
            if (result == "INVALID_STATUS") return BadRequest(new { message = "Only In Progress tickets can be resolved" });
            if (result == "NOT_ASSIGNED") return Unauthorized(new { message = "You are not assigned to this ticket" });

            return Ok(new { message = "Ticket resolved successfully", status = "Closed", resolvedBy = username });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error resolving ticket", error = ex.Message });
        }
    }

    [Authorize(Roles = "Admin,Agent")]
[HttpGet("user-kpis")]
public IActionResult GetUserKpiStats()
{
    try
    {
        var kpiStats = _ticketStatsDAL.GetUserKpiStats();
        return Ok(kpiStats);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = "Error fetching KPI stats", error = ex.Message });
    }
}
}