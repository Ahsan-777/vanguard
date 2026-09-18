// using System;
// using System.Collections.Generic;
// using System.IdentityModel.Tokens.Jwt;
// using System.Net;
// using System.Net.Mail;
// using System.Security.Claims;
// using System.Text;
// using System.Threading.Tasks;
// using backend_app3.DTOs;
// using backend_app3.Models;
// using backend_app3.Repositories;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Extensions.Configuration;
// using Microsoft.IdentityModel.Tokens;

// namespace backend_app3.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class AuthController : ControllerBase
//     {
//         private readonly IUserRepository _userRepository;
//         private readonly IPasswordHasher<User> _passwordHasher;
//         private readonly IConfiguration _configuration;

//         // In-memory OTP storage
//         private static readonly Dictionary<string, string> OtpStore = new();

//         public AuthController(
//             IUserRepository userRepository, 
//             IPasswordHasher<User> passwordHasher,
//             IConfiguration configuration)
//         {
//             _userRepository = userRepository;
//             _passwordHasher = passwordHasher;
//             _configuration = configuration;
//         }

//         [HttpPost("seed-system-accounts")]
//         public async Task<IActionResult> SeedSystemAccounts()
//         {
//             var systemAccounts = new[]
//             {
//                 new { Username = "admin", Role = "admin", Email = "admin@system.local" },
//                 new { Username = "accountant", Role = "accountant", Email = "accountant@system.local" },
//                 new { Username = "inventory", Role = "inventory", Email = "inventory@system.local" },
//                 new { Username = "shop", Role = "pos", Email = "shop@system.local" }
//             };

//             foreach (var account in systemAccounts)
//             {
//                 var existingUser = await _userRepository.GetByUsernameAsync(account.Username);

//                 if (existingUser == null)
//                 {
//                     var user = new User
//                     {
//                         Username = account.Username,
//                         Email = account.Email,
//                         Role = account.Role
//                     };

//                     user.PasswordHash = _passwordHasher.HashPassword(user, "1");
//                     await _userRepository.AddAsync(user);
//                 }
//                 else
//                 {
//                     existingUser.Role = account.Role;
//                     existingUser.Email = account.Email;
//                     existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, "1");
//                     _userRepository.Update(existingUser);
//                 }
//             }

//             await _userRepository.SaveChangesAsync();
//             return Ok(new { message = "System accounts created/updated with default emails and password '1'!" });
//         }

//         [HttpPost("register")]
//         public async Task<IActionResult> Register([FromBody] RegisterDto dto)
//         {
//             if (!ModelState.IsValid)
//             {
//                 return BadRequest(ModelState);
//             }

//             var cleanUsername = dto.Username.Trim();
//             var cleanEmail = dto.Email.Trim().ToLower();

//             var userExists = await _userRepository.UserExistsAsync(cleanUsername);

//             if (userExists)
//             {
//                 return BadRequest(new { message = "Username already exists." });
//             }

//             var buyer = new User
//             {
//                 Username = cleanUsername,
//                 Email = cleanEmail,
//                 Role = "Buyer"
//             };

//             buyer.PasswordHash = _passwordHasher.HashPassword(buyer, dto.Password);

//             await _userRepository.AddAsync(buyer);
//             await _userRepository.SaveChangesAsync();

//             return Ok(new { message = "Buyer registered successfully!" });
//         }

//         [HttpPost("login")]
//         public async Task<IActionResult> Login([FromBody] LoginDto dto)
//         {
//             if (!ModelState.IsValid)
//             {
//                 return Unauthorized(new { message = "Invalid username or password." });
//             }

//             var cleanUsername = dto.Username.Trim();

//             var user = await _userRepository.GetByUsernameAsync(cleanUsername);

//             if (user == null || string.IsNullOrEmpty(user.PasswordHash))
//             {
//                 return Unauthorized(new { message = "Invalid username or password." });
//             }

//             PasswordVerificationResult verificationResult;

//             try
//             {
//                 verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
//             }
//             catch (FormatException)
//             {
//                 return Unauthorized(new { message = "Invalid username or password." });
//             }

//             if (verificationResult == PasswordVerificationResult.Failed)
//             {
//                 return Unauthorized(new { message = "Invalid username or password." });
//             }

//             if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
//             {
//                 user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);
//                 await _userRepository.SaveChangesAsync();
//             }

//             var token = GenerateJwtToken(user);

//             var response = new AuthResponseDto
//             {
//                 Id = user.Id,
//                 Username = user.Username,
//                 Role = user.Role,
//                 Token = token
//             };

//             return Ok(response);
//         }

//         [HttpPost("forgot-password")]
//         public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
//         {
//             if (string.IsNullOrWhiteSpace(request.Username))
//             {
//                 return BadRequest(new { message = "Username is required." });
//             }

//             // 1. SQL Database se User fetch ho raha hai
//             var user = await _userRepository.GetByUsernameAsync(request.Username.Trim());
//             if (user == null)
//             {
//                 return NotFound(new { message = "Username does not exist in our database." });
//             }

//             // Check agar Database mein User ki Email Null/Empty hai
//             if (string.IsNullOrWhiteSpace(user.Email))
//             {
//                 return BadRequest(new { message = "No registered email found for this user in the database." });
//             }

//             // 2. Generate Random 6-Digit OTP
//             var generatedOtp = new Random().Next(100000, 999999).ToString();
//             OtpStore[user.Username.ToLower()] = generatedOtp;

//             try
//             {
//                 // Config Settings
//                 var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
//                 var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
//                 var senderEmail = _configuration["Smtp:SenderEmail"] ?? "your-system-email@gmail.com";
//                 var senderPassword = _configuration["Smtp:SenderPassword"] ?? "your-app-password";

//                 using var smtpClient = new SmtpClient(smtpHost)
//                 {
//                     Port = smtpPort,
//                     Credentials = new NetworkCredential(senderEmail, senderPassword),
//                     EnableSsl = true,
//                 };

//                 var mailMessage = new MailMessage
//                 {
//                     From = new MailAddress(senderEmail, "App System Security"),
//                     Subject = "Password Reset OTP",
//                     Body = $"Hello {user.Username},\n\nYour OTP code to reset your password is: {generatedOtp}\n\nThis OTP was sent to the email address registered with your account.",
//                     IsBodyHtml = false,
//                 };

//                 // DYNAMIC RECIPIENT: SQL DB se uthai hui Email lag rahi hai
//                 mailMessage.To.Add(user.Email.Trim());

//                 await smtpClient.SendMailAsync(mailMessage);

//                 return Ok(new { message = $"OTP code sent successfully to registered email ({MaskEmail(user.Email)})!" });
//             }
//             catch (Exception ex)
//             {
//                 Console.WriteLine($"[EMAIL ERROR]: {ex.Message}");
//                 return StatusCode(500, new { message = "Error sending OTP email. Please check server SMTP credentials." });
//             }
//         }

//         [HttpPost("reset-password")]
//         public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
//         {
//             if (string.IsNullOrWhiteSpace(request.Username) || 
//                 string.IsNullOrWhiteSpace(request.Otp) || 
//                 string.IsNullOrWhiteSpace(request.NewPassword))
//             {
//                 return BadRequest(new { message = "Invalid request fields." });
//             }

//             var usernameKey = request.Username.Trim().ToLower();

//             // Validate OTP
//             if (!OtpStore.TryGetValue(usernameKey, out var storedOtp) || storedOtp != request.Otp.Trim())
//             {
//                 return BadRequest(new { message = "Invalid or expired OTP code." });
//             }

//             var user = await _userRepository.GetByUsernameAsync(request.Username.Trim());
//             if (user == null)
//             {
//                 return NotFound(new { message = "User not found." });
//             }

//             // Update Password Hash
//             user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
//             _userRepository.Update(user);
//             await _userRepository.SaveChangesAsync();

//             // Clear used OTP
//             OtpStore.Remove(usernameKey);

//             return Ok(new { message = "Password updated successfully!" });
//         }

//         private string MaskEmail(string email)
//         {
//             if (string.IsNullOrEmpty(email) || !email.Contains('@')) return email;
//             var parts = email.Split('@');
//             if (parts[0].Length <= 2) return email;
//             return $"{parts[0][0]}***{parts[0][^1]}@{parts[1]}";
//         }

//         private string GenerateJwtToken(User user)
//         {
//             var jwtSettings = _configuration.GetSection("Jwt");
//             var secretKey = jwtSettings["Key"] ?? "YourSuperSecretKeyHere1234567890!";

//             var claims = new[]
//             {
//                 new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
//                 new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
//                 new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
//                 new Claim(ClaimTypes.Name, user.Username),
//                 new Claim(ClaimTypes.Role, user.Role ?? "Buyer"),
//                 new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
//             };

//             var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
//             var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

//             var token = new JwtSecurityToken(
//                 issuer: jwtSettings["Issuer"] ?? "http://localhost:5038",
//                 audience: jwtSettings["Audience"] ?? "http://localhost:5173",
//                 claims: claims,
//                 expires: DateTime.UtcNow.AddHours(8),
//                 signingCredentials: creds
//             );

//             return new JwtSecurityTokenHandler().WriteToken(token);
//         }
//     }
// }
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using backend_app3.DTOs;
using backend_app3.Models;
using backend_app3.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace backend_app3.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;

        // In-memory OTP storage
        private static readonly Dictionary<string, string> OtpStore = new();

        public AuthController(
            IUserRepository userRepository, 
            IPasswordHasher<User> passwordHasher,
            IConfiguration configuration)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
        }

        [HttpPost("seed-system-accounts")]
        public async Task<IActionResult> SeedSystemAccounts()
        {
            var systemAccounts = new[]
            {
                new { Username = "admin", Role = "admin", Email = "admin@system.local" },
                new { Username = "accountant", Role = "accountant", Email = "accountant@system.local" },
                new { Username = "inventory", Role = "inventory", Email = "inventory@system.local" },
                new { Username = "shop", Role = "pos", Email = "shop@system.local" }
            };

            foreach (var account in systemAccounts)
            {
                var existingUser = await _userRepository.GetByUsernameAsync(account.Username);

                if (existingUser == null)
                {
                    var user = new User
                    {
                        Username = account.Username,
                        Email = account.Email,
                        Role = account.Role
                    };

                    user.PasswordHash = _passwordHasher.HashPassword(user, "1");
                    await _userRepository.AddAsync(user);
                }
                else
                {
                    existingUser.Role = account.Role;
                    existingUser.Email = account.Email;
                    existingUser.PasswordHash = _passwordHasher.HashPassword(existingUser, "1");
                    _userRepository.Update(existingUser);
                }
            }

            await _userRepository.SaveChangesAsync();
            return Ok(new { message = "System accounts created/updated with default emails and password '1'!" });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cleanUsername = dto.Username.Trim();
            var cleanEmail = dto.Email.Trim().ToLower();

            var userExists = await _userRepository.UserExistsAsync(cleanUsername);

            if (userExists)
            {
                return BadRequest(new { message = "Username already exists." });
            }

            var buyer = new User
            {
                Username = cleanUsername,
                Email = cleanEmail,
                Role = "Buyer"
            };

            buyer.PasswordHash = _passwordHasher.HashPassword(buyer, dto.Password);

            await _userRepository.AddAsync(buyer);
            await _userRepository.SaveChangesAsync();

            return Ok(new { message = "Buyer registered successfully!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var cleanUsername = dto.Username.Trim();

            var user = await _userRepository.GetByUsernameAsync(cleanUsername);

            if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            PasswordVerificationResult verificationResult;

            try
            {
                verificationResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            }
            catch (FormatException)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);
                await _userRepository.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);

            var response = new AuthResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Role = user.Role,
                Token = token
            };

            return Ok(response);
        }

        // =====================================================
        // SAVE FCM TOKEN FOR PUSH NOTIFICATIONS
        // =====================================================
        [HttpPost("save-fcm-token")]
        [Authorize]
        public async Task<IActionResult> SaveFcmToken([FromBody] FcmTokenDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new { message = "Token is required." });
            }

            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized(new { message = "Invalid token authorization." });
            }

            var user = await _userRepository.GetByUsernameAsync(username);
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.FcmToken = dto.Token;
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(new { message = "FCM token updated successfully!" });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest(new { message = "Username is required." });
            }

            var user = await _userRepository.GetByUsernameAsync(request.Username.Trim());
            if (user == null)
            {
                return NotFound(new { message = "Username does not exist in our database." });
            }

            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest(new { message = "No registered email found for this user in the database." });
            }

            var generatedOtp = new Random().Next(100000, 999999).ToString();
            OtpStore[user.Username.ToLower()] = generatedOtp;

            try
            {
                var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "587");
                var senderEmail = _configuration["Smtp:SenderEmail"] ?? "your-system-email@gmail.com";
                var senderPassword = _configuration["Smtp:SenderPassword"] ?? "your-app-password";

                using var smtpClient = new SmtpClient(smtpHost)
                {
                    Port = smtpPort,
                    Credentials = new NetworkCredential(senderEmail, senderPassword),
                    EnableSsl = true,
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(senderEmail, "App System Security"),
                    Subject = "Password Reset OTP",
                    Body = $"Hello {user.Username},\n\nYour OTP code to reset your password is: {generatedOtp}\n\nThis OTP was sent to the email address registered with your account.",
                    IsBodyHtml = false,
                };

                mailMessage.To.Add(user.Email.Trim());

                await smtpClient.SendMailAsync(mailMessage);

                return Ok(new { message = $"OTP code sent successfully to registered email ({MaskEmail(user.Email)})!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EMAIL ERROR]: {ex.Message}");
                return StatusCode(500, new { message = "Error sending OTP email. Please check server SMTP credentials." });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Otp) || 
                string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Invalid request fields." });
            }

            var usernameKey = request.Username.Trim().ToLower();

            if (!OtpStore.TryGetValue(usernameKey, out var storedOtp) || storedOtp != request.Otp.Trim())
            {
                return BadRequest(new { message = "Invalid or expired OTP code." });
            }

            var user = await _userRepository.GetByUsernameAsync(request.Username.Trim());
            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            OtpStore.Remove(usernameKey);

            return Ok(new { message = "Password updated successfully!" });
        }

        private string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains('@')) return email;
            var parts = email.Split('@');
            if (parts[0].Length <= 2) return email;
            return $"{parts[0][0]}***{parts[0][^1]}@{parts[1]}";
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["Key"] ?? "YourSuperSecretKeyHere1234567890!";

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role ?? "Buyer"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"] ?? "http://localhost:5038",
                audience: jwtSettings["Audience"] ?? "http://localhost:5173",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class FcmTokenDto
    {
        public string Token { get; set; } = string.Empty;
    }
}