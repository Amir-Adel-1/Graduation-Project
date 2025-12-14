namespace Test_Project_API_02.DTOs
{
    public class CreateOrUpdateCartItemDto
    {
        public string ProductApiName { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }
}
