using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Ticket> Tickets { get; set; } = null!;
    public DbSet<TicketMessage> TicketMessages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Map Users table
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Username).HasColumnName("username");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
            entity.Property(e => e.Role).HasColumnName("role");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Map Tickets table
        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.ToTable("tickets");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TicketNumber).HasColumnName("ticket_number");
            entity.Property(e => e.Title).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Priority).HasColumnName("priority");
            entity.Property(e => e.CreatedBy).HasColumnName("created_by");
            entity.Property(e => e.AssignedTo).HasColumnName("assigned_to");
            entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        });

        // Map Ticket Messages table
        modelBuilder.Entity<TicketMessage>(entity =>
        {
            entity.ToTable("ticket_messages");
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TicketId).HasColumnName("ticket_id");
            entity.Property(e => e.SenderUsername).HasColumnName("sender_username");
            entity.Property(e => e.SenderRole).HasColumnName("sender_role");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });
    }
}