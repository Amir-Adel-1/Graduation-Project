using System;
using System.Collections.Generic;

namespace Test_Project_API_02.Models;

public partial class User
{
    public int IdUser { get; set; }

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }

    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = null!;

    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public string? BloodType { get; set; }
    public string? HealthStatus { get; set; }

    public DateTime CreateAt { get; set; } = DateTime.UtcNow;

    public string BlockStatus { get; set; } = "A";


    // ================= Navigation Properties =================

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<UsersAddress> UsersAddresses { get; set; } = new List<UsersAddress>();
    public virtual ICollection<UsersAllergy> UsersAllergies { get; set; } = new List<UsersAllergy>();
    public virtual ICollection<UsersChronicDisease> UsersChronicDiseases { get; set; } = new List<UsersChronicDisease>();
    public virtual ICollection<UsersPhone> UsersPhones { get; set; } = new List<UsersPhone>();
}
