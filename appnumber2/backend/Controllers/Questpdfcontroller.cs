using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.Data;          
using appnumber2.Templates;
using backend.DAL;
using backend.DTO;
namespace appnumber2.Controllers
{
    [ApiController]
    [Route("api/pdf")]
    public class QuestpdfController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TicketMessageDAL _ticketMessageDAL;

        public QuestpdfController(AppDbContext context, TicketMessageDAL ticketMessageDAL)
        {
            _context = context;
            _ticketMessageDAL = ticketMessageDAL;
        }

        // 1. OVERVIEW REPORT
        [Authorize]
        [HttpGet("download-report")]
        public async Task<IActionResult> DownloadReport()
        {
            try
            {
                var tickets = await _context.Tickets.ToListAsync();

                var reportData = new ReportDataDto
                {
                    Title = "Tickets Overview Report",
                    HeaderColor = Colors.Purple.Darken2,
                    Headers = new List<string> { "Ticket", "Title", "Created By", "Assigned To", "Status" },
                    Rows = tickets.Select(t => new List<string>
                    {
                        $"#{t.Id}",
                        t.Title ?? "N/A",
                        t.CreatedBy ?? "N/A",
                        t.AssignedTo ?? "Unassigned",
                        t.Status ?? "N/A"
                    }).ToList()
                };

                QuestPDF.Settings.License = LicenseType.Community;
                var document = new GenericReportTemplate(reportData);

                var stream = new MemoryStream();
                document.GeneratePdf(stream);
                stream.Position = 0;

                return File(stream, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating overview report", error = ex.Message });
            }
        }

        // 2. FULL AUDIT REPORT (All Tickets)
        [Authorize]
        [HttpGet("download-full-audit")]
        public async Task<IActionResult> DownloadFullAuditReport()
        {
            try
            {
                var tickets = await _context.Tickets.ToListAsync();
                var auditItems = new List<AuditTicketItemDto>();

                foreach (var ticket in tickets)
                {
                    bool isClosed = string.Equals(ticket.Status, "Closed", StringComparison.OrdinalIgnoreCase) ||
                                    string.Equals(ticket.Status, "Resolved", StringComparison.OrdinalIgnoreCase);

                    var item = new AuditTicketItemDto
                    {
                        TicketId = ticket.Id,
                        Title = ticket.Title ?? "N/A",
                        CreatedBy = ticket.CreatedBy ?? "N/A",
                        AssignedTo = ticket.AssignedTo ?? "Unassigned",
                        Status = ticket.Status ?? "N/A",
                        
                        TimeWaiting = ticket.CreatedAt != DateTime.MinValue 
                            ? ticket.CreatedAt.ToString("yyyy-MM-dd HH:mm") 
                            : "N/A",

                        TimeInProgress = ticket.InProgressAt != null && !string.IsNullOrWhiteSpace(ticket.InProgressAt.ToString()) 
                            ? (DateTime.TryParse(ticket.InProgressAt.ToString(), out DateTime parsedInProgress) 
                                ? parsedInProgress.ToString("yyyy-MM-dd HH:mm") 
                                : ticket.InProgressAt.ToString()) 
                            : "N/A",

                        TimeClosed = isClosed && ticket.UpdatedAt != null && !string.IsNullOrWhiteSpace(ticket.UpdatedAt.ToString()) 
                            ? (DateTime.TryParse(ticket.UpdatedAt.ToString(), out DateTime parsedClosed) 
                                ? parsedClosed.ToString("yyyy-MM-dd HH:mm") 
                                : ticket.UpdatedAt.ToString()) 
                            : "N/A"
                    };

                    try
                    {
                        var messages = _ticketMessageDAL.GetMessages(ticket.Id);
                        if (messages != null && messages.Count > 0)
                        {
                            foreach (var m in messages)
                            {
                                var type = m.GetType();

                                string GetProp(params string[] names)
                                {
                                    foreach (var name in names)
                                    {
                                        var prop = type.GetProperty(name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                                        if (prop != null)
                                        {
                                            var val = prop.GetValue(m, null);
                                            if (val != null) return val.ToString();
                                        }
                                    }
                                    return "";
                                }

                                string sender = GetProp("SenderUsername", "Sender", "Username", "CreatedBy");
                                string role = GetProp("SenderRole", "Role");
                                string text = GetProp("Message", "MessageText", "Text", "Content");
                                string sentAtRaw = GetProp("SentAt", "CreatedAt", "Timestamp");

                                string formattedDate = sentAtRaw;
                                if (DateTime.TryParse(sentAtRaw, out DateTime parsedDt))
                                {
                                    formattedDate = parsedDt.ToString("yyyy-MM-dd HH:mm");
                                }

                                string bulletLine = $"[{formattedDate}] {sender} ({role}): {text}";
                                if (!string.IsNullOrWhiteSpace(bulletLine))
                                {
                                    item.ChatMessages.Add(bulletLine);
                                }
                            }
                        }
                    }
                    catch
                    {
                        // Safely handle missing logs
                    }

                    auditItems.Add(item);
                }

                var reportData = new AuditReportDataDto
                {
                    Title = "System-Wide Ticket Audit & History Report",
                    HeaderColor = Colors.Purple.Darken2,
                    Tickets = auditItems
                };

                QuestPDF.Settings.License = LicenseType.Community;
                var document = new AuditReportTemplate(reportData);

                byte[] pdfBytes = document.GeneratePdf();
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating full audit report", error = ex.Message });
            }
        }

        // 3. SINGLE TICKET AUDIT REPORT
        [Authorize]
        [HttpGet("download-ticket-audit/{ticketId}")]
        public async Task<IActionResult> DownloadTicketAuditReport(int ticketId)
        {
            try
            {
                var ticket = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == ticketId);
                if (ticket == null)
                {
                    return NotFound(new { message = $"Ticket #{ticketId} not found." });
                }

                bool isClosed = string.Equals(ticket.Status, "Closed", StringComparison.OrdinalIgnoreCase) ||
                                string.Equals(ticket.Status, "Resolved", StringComparison.OrdinalIgnoreCase);

                var auditItem = new AuditTicketItemDto
                {
                    TicketId = ticket.Id,
                    Title = ticket.Title ?? "N/A",
                    CreatedBy = ticket.CreatedBy ?? "N/A",
                    AssignedTo = ticket.AssignedTo ?? "Unassigned",
                    Status = ticket.Status ?? "N/A",
                    
                    TimeWaiting = ticket.CreatedAt != DateTime.MinValue 
                        ? ticket.CreatedAt.ToString("yyyy-MM-dd HH:mm") 
                        : "N/A",

                    TimeInProgress = ticket.InProgressAt != null && !string.IsNullOrWhiteSpace(ticket.InProgressAt.ToString())
                        ? (DateTime.TryParse(ticket.InProgressAt.ToString(), out DateTime parsedInProgress) 
                            ? parsedInProgress.ToString("yyyy-MM-dd HH:mm") 
                            : ticket.InProgressAt.ToString())
                        : "N/A",

                    TimeClosed = isClosed && ticket.UpdatedAt != null && !string.IsNullOrWhiteSpace(ticket.UpdatedAt.ToString())
                        ? (DateTime.TryParse(ticket.UpdatedAt.ToString(), out DateTime parsedClosed) 
                            ? parsedClosed.ToString("yyyy-MM-dd HH:mm") 
                            : ticket.UpdatedAt.ToString())
                        : "N/A"
                };

                try
                {
                    var messages = _ticketMessageDAL.GetMessages(ticket.Id);
                    if (messages != null && messages.Count > 0)
                    {
                        foreach (var m in messages)
                        {
                            var type = m.GetType();

                            string GetProp(params string[] names)
                            {
                                foreach (var name in names)
                                {
                                    var prop = type.GetProperty(name, System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.IgnoreCase);
                                    if (prop != null)
                                    {
                                        var val = prop.GetValue(m, null);
                                        if (val != null) return val.ToString();
                                    }
                                }
                                return "";
                            }

                            string sender = GetProp("SenderUsername", "Sender", "Username", "CreatedBy");
                            string role = GetProp("SenderRole", "Role");
                            string text = GetProp("Message", "MessageText", "Text", "Content");
                            string sentAtRaw = GetProp("SentAt", "CreatedAt", "Timestamp");

                            string formattedDate = sentAtRaw;
                            if (DateTime.TryParse(sentAtRaw, out DateTime parsedDt))
                            {
                                formattedDate = parsedDt.ToString("yyyy-MM-dd HH:mm");
                            }

                            string bulletLine = $"[{formattedDate}] {sender} ({role}): {text}";
                            if (!string.IsNullOrWhiteSpace(bulletLine))
                            {
                                auditItem.ChatMessages.Add(bulletLine);
                            }
                        }
                    }
                }
                catch
                {
                    // Safely handle missing logs
                }

                var reportData = new AuditReportDataDto
                {
                    Title = $"Ticket #{ticket.Id} Audit & History Report",
                    HeaderColor = Colors.Purple.Darken2,
                    Tickets = new List<AuditTicketItemDto> { auditItem }
                };

                QuestPDF.Settings.License = LicenseType.Community;
                var document = new AuditReportTemplate(reportData);

                byte[] pdfBytes = document.GeneratePdf();
                return File(pdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating single ticket audit report", error = ex.Message });
            }
        }
    }
}