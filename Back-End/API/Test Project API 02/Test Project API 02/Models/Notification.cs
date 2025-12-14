using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class Notification
{
    public int IdNotification { get; set; }

    public DateTime CreateAt { get; set; }

    public int? IdUser { get; set; }

    public int? IdRequest { get; set; }

    public virtual MedicineRequest? IdRequestNavigation { get; set; }

    public virtual User? IdUserNavigation { get; set; }
}
