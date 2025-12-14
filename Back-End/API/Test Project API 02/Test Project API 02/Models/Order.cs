using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class Order
{
    public int IdOrder { get; set; }

    public DateTime CreateAtOrder { get; set; }

    public decimal TotalAmount { get; set; }

    public int? IdUser { get; set; }

    public int? IdCart { get; set; }

    public int? IdPaymentMethod { get; set; }

    public virtual Cart? IdCartNavigation { get; set; }

    public virtual PaymentMethod? IdPaymentMethodNavigation { get; set; }

    public virtual User? IdUserNavigation { get; set; }
}
