using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class MedicineRequest
{
    public int IdRequest { get; set; }

    public string MedicineName { get; set; } = null!;

    public DateTime CreateAt { get; set; }

    public string? OrderStatus { get; set; }

    public string Quantity { get; set; } = null!;

    public int? IdUser { get; set; }

    public virtual User? IdUserNavigation { get; set; }

    public virtual ICollection<MedicineAvailability> MedicineAvailabilities { get; set; } = new List<MedicineAvailability>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
