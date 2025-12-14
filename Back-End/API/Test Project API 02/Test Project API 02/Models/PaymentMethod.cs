using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class PaymentMethod
{
    public int IdPaymentMethod { get; set; }

    public string PaymentMethodType { get; set; } = null!;

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
