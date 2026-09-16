using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.DTO;
using backend.Models;
using backend.Utils;

namespace backend.DAL;

public class AuthDAL
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher<string> _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthDAL(
        AppDbContext context,
        IPasswordHasher<string> passwordHasher,
        JwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================
    public object Register(RegisterRequest request)
    {
        // Check if username already exists
        bool userExists = _context.Users.Any(u => u.Username == request.Username);
        if (userExists)
        {
            throw new Exception("Username already exists");
        }

        string assignedRole = string.IsNullOrWhiteSpace(request.Role)
            ? "User"
            : request.Role;

        string hashedPassword = _passwordHasher.HashPassword(
            request.Username,
            request.Password
        );

        var newUser = new User
        {
            Username = request.Username,
            PasswordHash = hashedPassword,
            Role = assignedRole,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(newUser);
        _context.SaveChanges();

        return new
        {
            message = "User created successfully",
            role = assignedRole
        };
    }

    // =========================
    // LOGIN
    // =========================
    public object Login(LoginRequest request)
    {
        var user = _context.Users
            .AsNoTracking()
            .FirstOrDefault(u => u.Username == request.Username);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        var result = _passwordHasher.VerifyHashedPassword(
            request.Username,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        string token = _jwtService.GenerateToken(
            user.Username,
            user.Role
        );

        return new
        {
            message = "Login successful",
            username = user.Username,
            role = user.Role,
            token = token
        };
    }

    // =========================
    // GET USERS
    // =========================
    public List<object> GetUsers()
    {
        return _context.Users
            .AsNoTracking()
            .Select(u => new
            {
                username = u.Username,
                role = u.Role
            })
            .ToList<object>();
    }

    // =========================
    // UPDATE USER ROLE
    // =========================
    public string UpdateUserRole(UpdateRoleRequest request)
    {
        var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        user.Role = request.NewRole;
        _context.SaveChanges();

        return $"User {request.Username} role changed to {request.NewRole}";
    }
}