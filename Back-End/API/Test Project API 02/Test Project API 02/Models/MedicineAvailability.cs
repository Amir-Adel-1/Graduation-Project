using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class MedicineAvailability
{
    public int AvailableQuantity { get; set; }

    public int IdRequest { get; set; }

    public int IdUserPh { get; set; }

    public virtual MedicineRequest IdRequestNavigation { get; set; } = null!;

    public virtual User IdUserPhNavigation { get; set; } = null!;
}
