using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class Cart
{
    public int IdCart { get; set; }

    public int TotalProducts { get; set; }

    public decimal TotalPrice { get; set; }

    public int? IdUser { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual User? IdUserNavigation { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
