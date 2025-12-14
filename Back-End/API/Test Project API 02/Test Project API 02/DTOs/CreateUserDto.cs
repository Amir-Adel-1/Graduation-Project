namespace Test_Project_API_02.DTOs
{
    public class CreateUserDto
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }

        public string? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }

        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }

        public decimal? Weight { get; set; }
        public decimal? Height { get; set; }
        public string? BloodType { get; set; }
        public string? HealthStatus { get; set; }
    }
}
