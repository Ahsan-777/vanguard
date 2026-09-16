using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace backend.Utils;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

   public string GenerateToken(string username, string role)
{
    var key = _configuration["Jwt:Key"];

    if (string.IsNullOrWhiteSpace(key))
    {
        throw new Exception("JWT key is missing");
    }

    var issuer = _configuration["Jwt:Issuer"];
    var audience = _configuration["Jwt:Audience"];

    var claims = new[]
    {
        new Claim(ClaimTypes.Name, username),
        new Claim(ClaimTypes.Role, role)
    };

    var securityKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(key)
    );

    var credentials = new SigningCredentials(
        securityKey,
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddHours(2),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
}