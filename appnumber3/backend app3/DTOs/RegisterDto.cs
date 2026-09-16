// using System.ComponentModel.DataAnnotations;

// namespace backend_app3.DTOs
// {
//     public class RegisterDto
//     {
//         [Required(ErrorMessage = "Username is required.")]
//         [StringLength(100, ErrorMessage = "Username cannot exceed 100 characters.")]
//         public string Username { get; set; } = string.Empty;

//         [Required(ErrorMessage = "Password is required.")]
//         [StringLength(100, MinimumLength = 1, ErrorMessage = "Password must be at least 1 character long.")]
//         public string Password { get; set; } = string.Empty;
//     }
// }
using System.ComponentModel.DataAnnotations;

namespace backend_app3.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Username is required.")]
        [StringLength(100, ErrorMessage = "Username cannot exceed 100 characters.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address format.")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Password must be at least 1 character long.")]
        public string Password { get; set; } = string.Empty;
    }
}