using Microsoft.EntityFrameworkCore;

namespace Test_Project_API_02.Models;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cart> Carts { get; set; }
    public virtual DbSet<CartItem> CartItems { get; set; }
    public virtual DbSet<Favorite> Favorites { get; set; }
    public virtual DbSet<MedicineAvailability> MedicineAvailabilities { get; set; }
    public virtual DbSet<MedicineRequest> MedicineRequests { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Order> Orders { get; set; }
    public virtual DbSet<PaymentMethod> PaymentMethods { get; set; }
    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UsersAddress> UsersAddresses { get; set; }
    public virtual DbSet<UsersAllergy> UsersAllergies { get; set; }
    public virtual DbSet<UsersChronicDisease> UsersChronicDiseases { get; set; }
    public virtual DbSet<UsersPhone> UsersPhones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ===================== Cart =====================
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.IdCart);

            entity.ToTable("Cart");

            entity.Property(e => e.IdCart).HasColumnName("Id_Cart");
            entity.Property(e => e.IdUser).HasColumnName("Id_User");

            entity.Property(e => e.TotalPrice)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Price");

            entity.Property(e => e.TotalProducts)
                .HasColumnName("Total_Products");

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.Carts)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== CartItem =====================
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.IdCartItem);

            entity.ToTable("Cart_Items");

            entity.Property(e => e.IdCartItem).HasColumnName("Id_Cart_Item");
            entity.Property(e => e.IdCart).HasColumnName("Id_Cart");

            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Price");

            entity.Property(e => e.Quantity)
                .HasColumnName("Quantity");

            entity.Property(e => e.ProductApiName)
                .HasMaxLength(255)
                .HasColumnName("Product_API_Name");

            entity.HasOne(d => d.IdCartNavigation)
                .WithMany(p => p.CartItems)
                .HasForeignKey(d => d.IdCart)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== Favorite =====================
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => e.IdFavorite);

            entity.ToTable("Favorite");

            entity.Property(e => e.IdFavorite).HasColumnName("Id_Favorite");
            entity.Property(e => e.IdUser).HasColumnName("Id_User");

            entity.Property(e => e.ProductApiName)
                .HasMaxLength(255)
                .HasColumnName("Product_API_Name");

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.Favorites)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== MedicineRequest =====================
        modelBuilder.Entity<MedicineRequest>(entity =>
        {
            entity.HasKey(e => e.IdRequest);

            entity.ToTable("Medicine_Requests");

            entity.Property(e => e.IdRequest).HasColumnName("Id_Request");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.MedicineName)
                .HasMaxLength(50)
                .HasColumnName("Medicine_Name");

            entity.Property(e => e.OrderStatus)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Order_Status");

            entity.Property(e => e.CreateAt)
                .HasColumnType("smalldatetime")
                .HasColumnName("Create_At")
                .HasDefaultValueSql("GETDATE()");

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany()
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===================== MedicineAvailability ✅ FIXED =====================
        modelBuilder.Entity<MedicineAvailability>(entity =>
        {
            entity.HasKey(e => new { e.IdRequest, e.IdUserPh });

            entity.ToTable("Medicine_Availability");

            entity.Property(e => e.IdRequest).HasColumnName("Id_Request");
            entity.Property(e => e.IdUserPh).HasColumnName("Id_User_PH");
            entity.Property(e => e.AvailableQuantity).HasColumnName("Available_Quantity");

            // ✅ ربط الطلب بالـ Collection الموجودة داخل MedicineRequest
            entity.HasOne(d => d.IdRequestNavigation)
                .WithMany(p => p.MedicineAvailabilities)
                .HasForeignKey(d => d.IdRequest)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ ربط الصيدلي (User) - مفيش Collection في User لِـ MedicineAvailability
            entity.HasOne(d => d.IdUserPhNavigation)
                .WithMany()
                .HasForeignKey(d => d.IdUserPh)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===================== Notifications ✅ FIXED =====================
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.IdNotification);

            entity.ToTable("Notifications");

            entity.Property(e => e.IdNotification)
                .HasColumnName("Id_Notification");

            entity.Property(e => e.CreateAt)
                .HasColumnType("smalldatetime")
                .HasColumnName("Create_At")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.IdUser).HasColumnName("Id_User");
            entity.Property(e => e.IdRequest).HasColumnName("Id_Request");

            // ✅ اربط Notification بالـ User عبر الـ Collection الموجودة داخل User
            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(u => u.Notifications)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Restrict);

            // ✅ اربط Notification بالـ Request عبر الـ Collection الموجودة داخل MedicineRequest
            entity.HasOne(d => d.IdRequestNavigation)
                .WithMany(r => r.Notifications)
                .HasForeignKey(d => d.IdRequest)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===================== Order =====================
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.IdOrder);

            entity.ToTable("Orders");

            entity.Property(e => e.IdOrder)
                .HasColumnName("Id_Order");

            entity.Property(e => e.CreateAtOrder)
                .HasColumnType("smalldatetime")
                .HasColumnName("Create_At_Order")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("Total_Amount");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.IdCart)
                .HasColumnName("Id_Cart");

            entity.Property(e => e.IdPaymentMethod)
                .HasColumnName("Id_Payment_Method");

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.IdCartNavigation)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.IdCart)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.IdPaymentMethodNavigation)
                .WithMany(p => p.Orders)
                .HasForeignKey(d => d.IdPaymentMethod)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // ===================== PaymentMethod =====================
        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.HasKey(e => e.IdPaymentMethod);

            entity.ToTable("Payment_Methods");

            entity.Property(e => e.IdPaymentMethod)
                .HasColumnName("Id_Payment_Method");

            entity.Property(e => e.PaymentMethodType)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("Payment_Method_Type");
        });

        // ===================== User =====================
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.IdUser);

            entity.ToTable("Users");

            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(15)
                .HasColumnName("First_Name");

            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(15)
                .HasColumnName("Last_Name");

            entity.Property(e => e.Gender)
                .HasColumnType("char(1)");

            entity.Property(e => e.DateOfBirth)
                .HasColumnName("Date_Of_Birth");

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Password)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(10);

            entity.Property(e => e.Weight)
                .HasColumnType("decimal(5,2)");

            entity.Property(e => e.Height)
                .HasColumnType("decimal(5,2)");

            entity.Property(e => e.BloodType)
                .HasMaxLength(3)
                .HasColumnName("Blood_Type");

            entity.Property(e => e.HealthStatus)
                .HasMaxLength(30)
                .HasColumnName("Health_Status");

            entity.Property(e => e.CreateAt)
                .HasColumnName("Create_At")
                .HasColumnType("smalldatetime")
                .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.BlockStatus)
                .HasColumnName("Block_Status")
                .HasColumnType("char(1)")
                .HasDefaultValue("A");
        });

        // ===================== UsersAddress =====================
        modelBuilder.Entity<UsersAddress>(entity =>
        {
            entity.HasKey(e => new { e.IdUser, e.Address });

            entity.ToTable("Users_Addresses");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.Address)
                .HasMaxLength(255);

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.UsersAddresses)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== UsersAllergy =====================
        modelBuilder.Entity<UsersAllergy>(entity =>
        {
            entity.HasKey(e => new { e.IdUser, e.Allergies });

            entity.ToTable("Users_Allergies");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.Allergies)
                .HasMaxLength(50);

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.UsersAllergies)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== UsersChronicDisease =====================
        modelBuilder.Entity<UsersChronicDisease>(entity =>
        {
            entity.HasKey(e => new { e.IdUser, e.ChronicDiseaseName });

            entity.ToTable("Users_Chronic_Diseases");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.ChronicDiseaseName)
                .HasMaxLength(50)
                .HasColumnName("Chronic_Disease_Name");

            entity.Property(e => e.DiseaseType)
                .HasMaxLength(20)
                .HasColumnName("Disease_Type");

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.UsersChronicDiseases)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===================== UsersPhone =====================
        modelBuilder.Entity<UsersPhone>(entity =>
        {
            entity.HasKey(e => new { e.IdUser, e.Phone });

            entity.ToTable("Users_Phones");

            entity.Property(e => e.IdUser)
                .HasColumnName("Id_User");

            entity.Property(e => e.Phone)
                .IsRequired()
                .HasMaxLength(15);

            entity.HasOne(d => d.IdUserNavigation)
                .WithMany(p => p.UsersPhones)
                .HasForeignKey(d => d.IdUser)
                .OnDelete(DeleteBehavior.Cascade);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
