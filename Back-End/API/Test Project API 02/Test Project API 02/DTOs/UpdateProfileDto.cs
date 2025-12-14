namespace Test_Project_API_02.DTOs
{
    public class UpdateProfileDto
    {
        public string? Password { get; set; }

        public decimal? Weight { get; set; }
        public decimal? Height { get; set; }

        public string? BloodType { get; set; }
        public string? HealthStatus { get; set; }
    }
}
