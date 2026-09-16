using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace backend_app3.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSoldToCar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cars",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Make = table.Column<string>(type: "longtext", nullable: false),
                    Model = table.Column<string>(type: "longtext", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Mileage = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "longtext", nullable: false),
                    EngineSize = table.Column<string>(type: "longtext", nullable: false),
                    Transmission = table.Column<string>(type: "longtext", nullable: false),
                    ImageUrl = table.Column<string>(type: "longtext", nullable: true),
                    IsSold = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cars", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cars");
        }
    }
}
