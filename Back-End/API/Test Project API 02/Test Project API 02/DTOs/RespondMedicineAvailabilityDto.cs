namespace Test_Project_API_02.DTOs
{
    public class RespondMedicineAvailabilityDto
    {
        public int RequestId { get; set; }

        // 0 = متوفر بالكامل
        // >0 = الكمية المتاحة
        public int AvailableQuantity { get; set; }
    }
}
