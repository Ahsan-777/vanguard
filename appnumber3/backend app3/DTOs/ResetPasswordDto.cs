namespace backend_app3.DTOs
{
    public class ResetPasswordDto
    {
        public string Username { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}