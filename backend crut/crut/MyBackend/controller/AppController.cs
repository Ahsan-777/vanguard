using Microsoft.AspNetCore.Mvc;
using MyBackend.DTO;
using MyBackend.INTERFACE;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MyBackend.UTILS;

namespace MyBackend.CONTROLLER;

[ApiController]
[Route("")]
public class AppController : ControllerBase
{
    private readonly IAppService appService;

    private readonly IConfiguration configuration;

public AppController(
    IAppService appService,
    IConfiguration configuration)
{
    this.appService = appService;
    this.configuration = configuration;
}

    // =========================
    // REGISTER ENDPOINT
    // =========================
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        bool result = appService.RegisterUser(request);

        if (!result)
        {
            return BadRequest(new { message = "User already exists or missing input." });
        }

        return Ok(new { message = "Account created successfully!" });
    }

    // =========================
    // LOGIN
    // =========================
   
  [HttpPost("login")]
public IActionResult Login(LoginRequest login)
{
    string ipAddress =
        HttpContext.Connection.RemoteIpAddress?.ToString()
        ?? "Unknown";

    bool result =
        appService.Login(login, ipAddress);

    if (!result)
    {
        return Unauthorized(new
        {
            message = "Invalid username, password or department."
        });
    }

    bool isAdmin =
        string.Equals(
            login.Username,
            PASSCODE.Username,
            StringComparison.OrdinalIgnoreCase
        );

    string token =
        JwtTokenGenerator.GenerateToken(
            login.Username,
            isAdmin,
            configuration
        );

    return Ok(new
    {
        message = "Login successful",
        username = login.Username,
        isAdmin = isAdmin,
        token = token
    });
}

    // =========================
    // SETTINGS
    // =========================
    [HttpPut("settings")]
    public IActionResult UpdateSettings(SettingsRequest settings)
    {
        bool result = appService.UpdateSettings(settings);

        if (!result)
        {
            return BadRequest("All fields are required");
        }

        return Ok(new
        {
            message = "Settings updated successfully",
            username = settings.Username,
            department = settings.Department
        });
    }


    // =========================
// CHANGE PASSWORD
// =========================

[HttpPut("change-password")]
public IActionResult ChangePassword(
    [FromBody] ChangePasswordRequest request)
{
    bool result =
        appService.ChangePassword(request);

    if (!result)
    {
        return BadRequest(new
        {
            message = "Current password is incorrect or user does not exist."
        });
    }

    return Ok(new
    {
        message = "Password changed successfully!"
    });
}

   // =========================
// GET STUDENTS
// =========================
[Authorize]
[HttpGet("students")]
public IActionResult GetStudents()
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    return Ok(
        appService.GetStudents(username)
    );
}
// =========================
// UPDATE STUDENT
// =========================
[Authorize]
[HttpPut("students/{id}")]
public IActionResult UpdateStudent(
    int id,
    StudentDto student)
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    var result =
        appService.UpdateStudent(
            id,
            student,
            username
        );

    if (result == null)
    {
        return NotFound(
            "You cannot edit this student's data."
        );
    }

    return Ok(new
    {
        message = "Data updated successfully",
        data = result
    });
}

    // =========================
    // ADD STUDENT
    // =========================
    [Authorize]
[HttpPost("students")]
public IActionResult AddStudent(StudentDto student)
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    student.Username = username;

    var result =
        appService.AddStudent(student);

    return Ok(result);
}
  

    // =========================
    // DELETE STUDENT
    // =========================
 [Authorize]
[HttpDelete("students/{id}")]
public IActionResult DeleteStudent(int id)
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    bool result =
        appService.DeleteStudent(
            id,
            username
        );

    if (!result)
    {
        return NotFound(
            "You cannot delete this student's data."
        );
    }

    return Ok("Student deleted");
}

    // =========================
    // DELETE ALL STUDENTS
    // =========================
   [Authorize(Roles = "Admin")]
[HttpDelete("students")]
public IActionResult DeleteAllStudents()
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    bool result =
        appService.DeleteAllStudents(username);

    if (!result)
    {
        return Forbid();
    }

    return Ok("All students deleted");
}
  [Authorize(Roles = "Admin")]
[HttpGet("users")]
public IActionResult GetUsers()
{
    return Ok(appService.GetUsers());
}

    // =========================
    // LOGOUT
    // =========================
    [Authorize]
[HttpPost("logout")]
public IActionResult Logout()
{
    string username =
        User.FindFirst(ClaimTypes.Name)?.Value ?? "";

    if (string.IsNullOrEmpty(username))
    {
        return Unauthorized();
    }

    appService.Logout(username);

    return Ok(new
    {
        message = "Logout successful"
    });
}

    // =========================
    // GET ACTIVE USERS - ADMIN ONLY
    // =========================
    [HttpGet("active-users")]
  [Authorize(Roles = "Admin")]
public IActionResult GetActiveUsers()
{
    var activeUsers =
        appService.GetActiveUsers();

    return Ok(activeUsers);
}
}