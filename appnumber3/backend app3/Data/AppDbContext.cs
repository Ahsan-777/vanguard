// using backend_app3.Models;
// using Microsoft.EntityFrameworkCore;

// namespace backend_app3.Data
// {
//     public class AppDbContext : DbContext
//     {
//         public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

//         public DbSet<User> Users { get; set; }
//         public DbSet<Car> Cars { get; set; }
//         public DbSet<SparePart> SpareParts { get; set; }
//         public DbSet<SaleRecord> SalesRecords { get; set; }

//         protected override void OnModelCreating(ModelBuilder modelBuilder)
//         {
//             base.OnModelCreating(modelBuilder);

//             // Configure Cars Table
//             modelBuilder.Entity<Car>(entity =>
//             {
//                 entity.ToTable("Cars");
//                 entity.HasKey(c => c.Id);
//             });

//             // Configure SpareParts Table
//             modelBuilder.Entity<SparePart>(entity =>
//             {
//                 entity.ToTable("SpareParts");
//                 entity.HasKey(p => p.Id);
//             });

//             // Configure SalesRecords Table
//             modelBuilder.Entity<SaleRecord>(entity =>
//             {
//                 entity.ToTable("SalesRecords");
//                 entity.HasKey(s => s.Id);
//                 entity.Property(s => s.ItemType).HasColumnName("ItemType");
//                 entity.Property(s => s.ItemId).HasColumnName("ItemId");
//                 entity.Property(s => s.Quantity).HasColumnName("Quantity");
//                 entity.Property(s => s.TotalAmount).HasColumnName("TotalAmount");
//                 entity.Property(s => s.CustomerName).HasColumnName("CustomerName");
//                 entity.Property(s => s.CustomerPhone).HasColumnName("CustomerPhone");
//                 entity.Property(s => s.SaleDate).HasColumnName("SaleDate");
//             });
//         }
//     }
// }
using backend_app3.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_app3.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<SparePart> SpareParts { get; set; }
        public DbSet<SaleRecord> SalesRecords { get; set; }
        public DbSet<ChatResponse> ChatResponses { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Cars Table
            modelBuilder.Entity<Car>(entity =>
            {
                entity.ToTable("Cars");
                entity.HasKey(c => c.Id);
            });

            // Configure SpareParts Table
            modelBuilder.Entity<SparePart>(entity =>
            {
                entity.ToTable("SpareParts");
                entity.HasKey(p => p.Id);
            });

            // Configure SalesRecords Table
            modelBuilder.Entity<SaleRecord>(entity =>
            {
                entity.ToTable("SalesRecords");
                entity.HasKey(s => s.Id);
                entity.Property(s => s.ItemType).HasColumnName("ItemType");
                entity.Property(s => s.ItemId).HasColumnName("ItemId");
                entity.Property(s => s.Quantity).HasColumnName("Quantity");
                entity.Property(s => s.TotalAmount).HasColumnName("TotalAmount");
                entity.Property(s => s.CustomerName).HasColumnName("CustomerName");
                entity.Property(s => s.CustomerPhone).HasColumnName("CustomerPhone");
                entity.Property(s => s.SaleDate).HasColumnName("SaleDate");
            });

            // Configure ChatResponses Table
            modelBuilder.Entity<ChatResponse>(entity =>
            {
                entity.ToTable("ChatResponses");
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Keyword).IsRequired();
                entity.Property(c => c.BotReply).IsRequired();
            });
        }
    }
}