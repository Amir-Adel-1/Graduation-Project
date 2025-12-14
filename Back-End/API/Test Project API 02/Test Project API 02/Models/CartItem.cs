using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class CartItem
{
    public int IdCartItem { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public string ProductApiName { get; set; } = null!;

    public int? IdCart { get; set; }

    public virtual Cart? IdCartNavigation { get; set; }
}
