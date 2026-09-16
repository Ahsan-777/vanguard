namespace MyBackend.DTO;

public class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Department { get; set; } = "";
}

public class SettingsRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Department { get; set; } = "";
}
public class ChangePasswordRequest
{
    public string Username { get; set; } = "";
    public string OldPassword { get; set; } = "";
    public string NewPassword { get; set; } = "";
}
public class StudentDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public string Username { get; set; } = "";
}
public class RegisterRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Department { get; set; } = "";
}

public class UserDto
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Department { get; set; } = "";
}
public class UserDisplayDto
{
    public string Username { get; set; } = "";
    public string Department { get; set; } = "";
}