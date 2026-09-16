namespace backend.DTO;

public class UpdateRoleRequest
{
    public string Username { get; set; } = string.Empty;
    public string NewRole { get; set; } = string.Empty;
    public string AdminUsername { get; set; } = "";

}