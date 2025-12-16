using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Test_Project_API_02.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToCartItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Payment_Methods",
                columns: table => new
                {
                    Id_Payment_Method = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Payment_Method_Type = table.Column<string>(type: "char(1)", unicode: false, fixedLength: true, maxLength: 1, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payment_Methods", x => x.Id_Payment_Method);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    First_Name = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Last_Name = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false),
                    Gender = table.Column<string>(type: "char(1)", nullable: true),
                    Date_Of_Birth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Height = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Blood_Type = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    Health_Status = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Create_At = table.Column<DateTime>(type: "smalldatetime", nullable: false, defaultValueSql: "GETDATE()"),
                    Block_Status = table.Column<string>(type: "char(1)", nullable: false, defaultValue: "A")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id_User);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    Id_Cart = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Total_Products = table.Column<int>(type: "int", nullable: false),
                    Total_Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart", x => x.Id_Cart);
                    table.ForeignKey(
                        name: "FK_Cart_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Favorite",
                columns: table => new
                {
                    Id_Favorite = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Product_API_Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorite", x => x.Id_Favorite);
                    table.ForeignKey(
                        name: "FK_Favorite_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Medicine_Requests",
                columns: table => new
                {
                    Id_Request = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Medicine_Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Create_At = table.Column<DateTime>(type: "smalldatetime", nullable: false, defaultValueSql: "GETDATE()"),
                    Order_Status = table.Column<string>(type: "char(1)", unicode: false, fixedLength: true, maxLength: 1, nullable: true),
                    Quantity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicine_Requests", x => x.Id_Request);
                    table.ForeignKey(
                        name: "FK_Medicine_Requests_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Users_Addresses",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users_Addresses", x => new { x.Id_User, x.Address });
                    table.ForeignKey(
                        name: "FK_Users_Addresses_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users_Allergies",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Allergies = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users_Allergies", x => new { x.Id_User, x.Allergies });
                    table.ForeignKey(
                        name: "FK_Users_Allergies_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users_Chronic_Diseases",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Chronic_Disease_Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Disease_Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users_Chronic_Diseases", x => new { x.Id_User, x.Chronic_Disease_Name });
                    table.ForeignKey(
                        name: "FK_Users_Chronic_Diseases_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users_Phones",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users_Phones", x => new { x.Id_User, x.Phone });
                    table.ForeignKey(
                        name: "FK_Users_Phones_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cart_Items",
                columns: table => new
                {
                    Id_Cart_Item = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Product_API_Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Image_Url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Id_Cart = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cart_Items", x => x.Id_Cart_Item);
                    table.ForeignKey(
                        name: "FK_Cart_Items_Cart_Id_Cart",
                        column: x => x.Id_Cart,
                        principalTable: "Cart",
                        principalColumn: "Id_Cart",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id_Order = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Create_At_Order = table.Column<DateTime>(type: "smalldatetime", nullable: false, defaultValueSql: "GETDATE()"),
                    Total_Amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: true),
                    Id_Cart = table.Column<int>(type: "int", nullable: true),
                    Id_Payment_Method = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id_Order);
                    table.ForeignKey(
                        name: "FK_Orders_Cart_Id_Cart",
                        column: x => x.Id_Cart,
                        principalTable: "Cart",
                        principalColumn: "Id_Cart",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Payment_Methods_Id_Payment_Method",
                        column: x => x.Id_Payment_Method,
                        principalTable: "Payment_Methods",
                        principalColumn: "Id_Payment_Method",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Orders_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicine_Availability",
                columns: table => new
                {
                    Id_Request = table.Column<int>(type: "int", nullable: false),
                    Id_User_PH = table.Column<int>(type: "int", nullable: false),
                    Available_Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicine_Availability", x => new { x.Id_Request, x.Id_User_PH });
                    table.ForeignKey(
                        name: "FK_Medicine_Availability_Medicine_Requests_Id_Request",
                        column: x => x.Id_Request,
                        principalTable: "Medicine_Requests",
                        principalColumn: "Id_Request",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Medicine_Availability_Users_Id_User_PH",
                        column: x => x.Id_User_PH,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id_Notification = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Create_At = table.Column<DateTime>(type: "smalldatetime", nullable: false, defaultValueSql: "GETDATE()"),
                    Id_User = table.Column<int>(type: "int", nullable: true),
                    Id_Request = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id_Notification);
                    table.ForeignKey(
                        name: "FK_Notifications_Medicine_Requests_Id_Request",
                        column: x => x.Id_Request,
                        principalTable: "Medicine_Requests",
                        principalColumn: "Id_Request",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_Id_User",
                        column: x => x.Id_User,
                        principalTable: "Users",
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Id_User",
                table: "Cart",
                column: "Id_User");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_Items_Id_Cart",
                table: "Cart_Items",
                column: "Id_Cart");

            migrationBuilder.CreateIndex(
                name: "IX_Favorite_Id_User",
                table: "Favorite",
                column: "Id_User");

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_Availability_Id_User_PH",
                table: "Medicine_Availability",
                column: "Id_User_PH");

            migrationBuilder.CreateIndex(
                name: "IX_Medicine_Requests_Id_User",
                table: "Medicine_Requests",
                column: "Id_User");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Id_Request",
                table: "Notifications",
                column: "Id_Request");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_Id_User",
                table: "Notifications",
                column: "Id_User");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_Cart",
                table: "Orders",
                column: "Id_Cart");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_Payment_Method",
                table: "Orders",
                column: "Id_Payment_Method");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_Id_User",
                table: "Orders",
                column: "Id_User");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cart_Items");

            migrationBuilder.DropTable(
                name: "Favorite");

            migrationBuilder.DropTable(
                name: "Medicine_Availability");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Users_Addresses");

            migrationBuilder.DropTable(
                name: "Users_Allergies");

            migrationBuilder.DropTable(
                name: "Users_Chronic_Diseases");

            migrationBuilder.DropTable(
                name: "Users_Phones");

            migrationBuilder.DropTable(
                name: "Medicine_Requests");

            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "Payment_Methods");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
