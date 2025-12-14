using System.ComponentModel.DataAnnotations.Schema;

namespace Test_Project_API_02.Models
{
    [Table("Users_Chronic_Diseases")]
    public partial class UsersChronicDisease
    {
        public int IdUser { get; set; }

        public string ChronicDiseaseName { get; set; } = null!;

        public string? DiseaseType { get; set; }

        public virtual User IdUserNavigation { get; set; } = null!;
    }
}
