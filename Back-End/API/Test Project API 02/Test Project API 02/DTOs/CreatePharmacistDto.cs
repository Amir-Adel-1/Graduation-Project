namespace Test_Project_API_02.DTOs
{
    public class CreatePharmacistDto
    {
        public required string PharmacyName { get; set; }
        public required string Address { get; set; }
        public required string Phone { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
