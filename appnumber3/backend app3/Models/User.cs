// using System;
// using System.ComponentModel.DataAnnotations;

// namespace backend_app3.Models
// {
//     public class User
//     {
//         public int Id { get; set; }

//         [Required]
//         [StringLength(100)]
//         public string Username { get; set; } = string.Empty;

//         [Required]
//         public string PasswordHash { get; set; } = string.Empty;

//         // Roles: "admin", "accountant", "inventory", "Buyer"
//         [Required]
//         [StringLength(50)]
//         public string Role { get; set; } = "Buyer";

//         public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
//     }
// }
using System;
using System.ComponentModel.DataAnnotations;

namespace backend_app3.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty; // <-- Email added

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        // Roles: "admin", "accountant", "inventory", "Buyer"
        [Required]
        [StringLength(50)]
        public string Role { get; set; } = "Buyer";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}