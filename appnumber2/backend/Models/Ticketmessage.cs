using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("ticket_messages")]
public class TicketMessage
{
    [Column("id")]
    public int Id { get; set; }

    [Column("ticket_id")]
    public int TicketId { get; set; }

    [Column("sender_username")]
    public string SenderUsername { get; set; } = string.Empty;

    [Column("sender_role")]
    public string SenderRole { get; set; } = string.Empty;

    [Column("message")]
    public string Message { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}