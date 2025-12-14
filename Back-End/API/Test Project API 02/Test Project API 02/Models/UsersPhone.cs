using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class UsersPhone
{
    public int IdUser { get; set; }

    public string Phone { get; set; } = null!;

    public virtual User IdUserNavigation { get; set; } = null!;
}
