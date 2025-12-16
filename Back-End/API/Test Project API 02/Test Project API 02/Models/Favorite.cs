using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Test_Project_API_02.Models;

[Table("Favorite")]
public partial class Favorite
{
    [Key]
    [Column("Id_Favorite")]
    public int IdFavorite { get; set; }

    [Required]
    [Column("Product_API_Name")]
    public string ProductApiName { get; set; } = null!;

    [Column("Price")]
    public decimal Price { get; set; }

    [Column("Image_Url")]
    public string? ImageUrl { get; set; }

    [Column("Id_User")]
    public int? IdUser { get; set; }

    [ForeignKey("IdUser")]
    public virtual User? IdUserNavigation { get; set; }
}
