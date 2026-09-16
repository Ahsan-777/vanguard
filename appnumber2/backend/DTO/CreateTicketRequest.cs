namespace backend.DTO;
using System.ComponentModel.DataAnnotations;
public class CreateTicketRequest
{
    [Required]
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public string CreatedBy { get; set; } = "";
   [Required]
    public string Complexity { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public IFormFile? ImageFile { get; set; }
    public string? StorageType { get; set; }
    
}