using System.Security.Cryptography;
using System.Text;

namespace MyBackend;

public class User
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
}

public static class PASSCODE
{
    // ApDAL.cs ke liye purani static variables (Compiling error fix karne ke liye)
    public static string Username = "admin";
    public static string Password = "1234";
    public static string Department = "cs";

    // Hash Helper Function
    public static string HashPassword(string rawPassword)
    {
        if (string.IsNullOrEmpty(rawPassword)) return string.Empty;

        using var sha256 = SHA256.Create();
        byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawPassword));
        StringBuilder builder = new StringBuilder();
        foreach (byte b in bytes)
        {
            builder.Append(b.ToString("x2"));
        }
        return builder.ToString();
    }

    // Dynamic Multiple Users List
    public static List<User> UsersList = new List<User>
    {
        new User {
            Username = "ahsan",
            Password = HashPassword("1234"),
            Department = "cs"
        }
    };
}