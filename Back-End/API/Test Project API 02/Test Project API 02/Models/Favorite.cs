using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class Favorite
{
    public int IdFavorite { get; set; }

    public string ProductApiName { get; set; } = null!;

    public int? IdUser { get; set; }

    public virtual User? IdUserNavigation { get; set; }
}
