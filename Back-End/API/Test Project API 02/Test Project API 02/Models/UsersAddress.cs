using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class UsersAddress
{
    public int IdUser { get; set; }

    public string Address { get; set; } = null!;

    public virtual User IdUserNavigation { get; set; } = null!;
}
