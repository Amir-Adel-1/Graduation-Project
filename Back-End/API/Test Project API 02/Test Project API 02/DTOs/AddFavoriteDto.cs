namespace Test_Project_API_02.DTOs
{
    public class AddFavoriteDto
    {
        public string ProductApiName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}
