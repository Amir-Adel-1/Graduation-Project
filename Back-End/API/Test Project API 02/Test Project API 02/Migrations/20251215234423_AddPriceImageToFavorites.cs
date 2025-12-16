using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Test_Project_API_02.Migrations
{
    /// <inheritdoc />
    public partial class AddPriceImageToFavorites : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Favorite",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "Favorite",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Favorite");

            migrationBuilder.DropColumn(
                name: "Price",
                table: "Favorite");
        }
    }
}
