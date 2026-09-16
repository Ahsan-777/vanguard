using backend_app3.Data;
using backend_app3.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend_app3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

   [HttpPost("reply")]
public async Task<IActionResult> GetReply([FromBody] ChatRequest request)
{
    if (request == null || string.IsNullOrWhiteSpace(request.Message))
    {
        return Ok(new { text = "Please enter a valid message." });
    }

    string userMsg = request.Message.Trim().ToLower();
    var responses = await _context.ChatResponses.ToListAsync();

    var match = responses.FirstOrDefault(r => 
        !string.IsNullOrEmpty(r.Keyword) && 
        userMsg.Contains(r.Keyword.Trim().ToLower())
    );

    if (match != null)
    {
        return Ok(new { 
            text = match.BotReply, 
            redirectUrl = match.RedirectUrl 
        });
    }

    return Ok(new { 
        text = "Thank you for reaching out! A representative will assist you shortly.",
        redirectUrl = (string?)null
    });
}
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }
}