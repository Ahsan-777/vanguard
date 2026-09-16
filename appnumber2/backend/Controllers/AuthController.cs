using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using backend.DAL;
using backend.DTO;

namespace backend.Controllers;

[ApiController]
[Route("Auth")]
public class AuthController : ControllerBase
{
    private readonly AuthDAL _authDAL;

    public AuthController(AuthDAL authDAL)
    {
        _authDAL = authDAL;
    }

    // =========================
    // REGISTER
    // =========================

    [HttpPost("register")]
    public IActionResult Register(
        [FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Username and Password are required"
            });
        }

        try
        {
            var result = _authDAL.Register(request);

            return Ok(result);
        }
        catch (Exception ex)
        {
            if (ex.Message == "Username already exists")
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }

            return BadRequest(new
            {
                message = "Could not create user"
            });
        }
    }

    // =========================
    // LOGIN
    // =========================
[HttpPost("login")]
public IActionResult Login([FromBody] LoginRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest(new
        {
            message = "Username and Password are required"
        });
    }

    try
    {
        var result = _authDAL.Login(request);
        return Ok(result);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new
        {
            message = ex.Message
        });
    }
    catch (Exception ex)
    {
        // Capture EF Core / DB internal exceptions cleanly
        return StatusCode(500, new
        {
            message = ex.Message,
            innerError = ex.InnerException?.Message
        });
    }
}
    // =========================
    // GET USERS
    // ADMIN ONLY
    // =========================

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public IActionResult GetUsers()
    {
        var users = _authDAL.GetUsers();

        return Ok(users);
    }

    // =========================
    // UPDATE USER ROLE
    // ADMIN ONLY
    // =========================

    [Authorize(Roles = "Admin")]
    [HttpPost("update-role")]
    public IActionResult UpdateUserRole(
        [FromBody] UpdateRoleRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.NewRole))
        {
            return BadRequest(new
            {
                message = "Username and NewRole are required"
            });
        }

        if (request.NewRole != "User" &&
            request.NewRole != "Agent")
        {
            return BadRequest(new
            {
                message = "Role must be User or Agent"
            });
        }

        try
        {
            string message =
                _authDAL.UpdateUserRole(request);

            return Ok(new
            {
                message = message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }
}