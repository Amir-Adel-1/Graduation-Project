namespace Test_Project_API_02.Models
{
    public partial class MedicineAvailability
    {
        public int IdRequest { get; set; }
        public int IdUserPh { get; set; }
        public int AvailableQuantity { get; set; }

        public virtual MedicineRequest? IdRequestNavigation { get; set; }
        public virtual User? IdUserPhNavigation { get; set; }
    }
}
