namespace backend_app3.Models
{
    public class ChatResponse
    {
        public int Id { get; set; }
        public string Keyword { get; set; } = string.Empty;
        public string BotReply { get; set; } = string.Empty;
        public string? RedirectUrl { get; set; }
    }
}