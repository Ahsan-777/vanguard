using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MyBackend.UTILS;

public static class JwtTokenGenerator
{
    public static string GenerateToken(
        string username,
        bool isAdmin,
        IConfiguration configuration)
    {
        var key = configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key is missing.");

        var issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer is missing.");

        var audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience is missing.");

        var expiryMinutes =
            configuration.GetValue<int>("Jwt:ExpiryMinutes");

        var claims = new List<Claim>
        {
            new Claim(
                ClaimTypes.Name,
                username
            ),

            new Claim(
                ClaimTypes.Role,
                isAdmin ? "Admin" : "User"
            )
        };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(
                    expiryMinutes
                ),
                signingCredentials: credentials
            );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}