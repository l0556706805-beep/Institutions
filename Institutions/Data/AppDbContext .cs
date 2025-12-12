using Microsoft.EntityFrameworkCore;
using EducationOrdersAPI.Models;
using EducationOrdersAPI.Models;

namespace EducationOrdersAPI.Data
{
    public class InstitutionsContext : DbContext
    {
        public InstitutionsContext(DbContextOptions<InstitutionsContext> opts) : base(opts) { }

        public DbSet<Institution> Institutions { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Constraints / indexes
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Seed optional: you can seed here or use separate seed class
        }
    }
}






//using System;
//using System.Collections.Generic;
//using EducationOrdersAPI.Models;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Metadata;

//namespace EducationOrdersAPI.Data
//{
//    public partial class InstitutionsContext : DbContext
//    {
//        public InstitutionsContext()
//        {
//        }

//        public InstitutionsContext(DbContextOptions<InstitutionsContext> options)
//            : base(options)
//        {
//        }

//        public virtual DbSet<AuditLog> AuditLogs { get; set; } = null!;
//        public virtual DbSet<Category> Categories { get; set; } = null!;
//        public virtual DbSet<Institution> Institutions { get; set; } = null!;
//        public virtual DbSet<Order> Orders { get; set; } = null!;
//        public virtual DbSet<OrderItem> OrderItems { get; set; } = null!;
//        public virtual DbSet<Product> Products { get; set; } = null!;
//        public virtual DbSet<User> Users { get; set; } = null!;

//        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//        {
//            if (!optionsBuilder.IsConfigured)
//            {
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
//                optionsBuilder.UseSqlServer("Server=hirshman;Database=Institutions;Trusted_Connection=True;");
//            }
//        }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//            modelBuilder.Entity<AuditLog>(entity =>
//            {
//                entity.Property(e => e.Action).HasMaxLength(200);

//                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

//                entity.HasOne(d => d.User)
//                    .WithMany(p => p.AuditLogs)
//                    .HasForeignKey(d => d.UserId)
//                    .HasConstraintName("FK__AuditLogs__UserI__3E52440B");
//            });

//            modelBuilder.Entity<Category>(entity =>
//            {
//                entity.Property(e => e.Description).HasMaxLength(300);

//                entity.Property(e => e.Name).HasMaxLength(150);
//            });

//            modelBuilder.Entity<Institution>(entity =>
//            {
//                entity.Property(e => e.Address).HasMaxLength(300);

//                entity.Property(e => e.ContactName).HasMaxLength(100);

//                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

//                entity.Property(e => e.Name).HasMaxLength(200);

//                entity.Property(e => e.Phone).HasMaxLength(20);
//            });

//            modelBuilder.Entity<Order>(entity =>
//            {
//                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

//                entity.Property(e => e.Status).HasMaxLength(20);

//                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");

//                entity.HasOne(d => d.Institution)
//                    .WithMany(p => p.Orders)
//                    .HasForeignKey(d => d.InstitutionId)
//                    .OnDelete(DeleteBehavior.ClientSetNull)
//                    .HasConstraintName("FK__Orders__Institut__35BCFE0A");

//                entity.HasOne(d => d.User)
//                    .WithMany(p => p.Orders)
//                    .HasForeignKey(d => d.UserId)
//                    .OnDelete(DeleteBehavior.ClientSetNull)
//                    .HasConstraintName("FK__Orders__UserId__36B12243");
//            });

//            modelBuilder.Entity<OrderItem>(entity =>
//            {
//                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

//                entity.HasOne(d => d.Order)
//                    .WithMany(p => p.OrderItems)
//                    .HasForeignKey(d => d.OrderId)
//                    .OnDelete(DeleteBehavior.ClientSetNull)
//                    .HasConstraintName("FK__OrderItem__Order__398D8EEE");

//                entity.HasOne(d => d.Product)
//                    .WithMany(p => p.OrderItems)
//                    .HasForeignKey(d => d.ProductId)
//                    .OnDelete(DeleteBehavior.ClientSetNull)
//                    .HasConstraintName("FK__OrderItem__Produ__3A81B327");
//            });

//            modelBuilder.Entity<Product>(entity =>
//            {
//                entity.Property(e => e.Description).HasMaxLength(300);

//                entity.Property(e => e.ImageUrl).HasMaxLength(500);

//                entity.Property(e => e.IsActive).HasDefaultValueSql("((1))");

//                entity.Property(e => e.Name).HasMaxLength(200);

//                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");

//                entity.Property(e => e.Unit).HasMaxLength(50);

//                entity.HasOne(d => d.Category)
//                    .WithMany(p => p.Products)
//                    .HasForeignKey(d => d.CategoryId)
//                    .OnDelete(DeleteBehavior.ClientSetNull)
//                    .HasConstraintName("FK__Products__Catego__300424B4");
//            });

//            modelBuilder.Entity<User>(entity =>
//            {
//                entity.HasIndex(e => e.Email, "UQ__Users__A9D1053466AF2460")
//                    .IsUnique();

//                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");

//                entity.Property(e => e.Email).HasMaxLength(200);

//                entity.Property(e => e.FullName).HasMaxLength(150);

//                entity.Property(e => e.PasswordHash).HasMaxLength(500);

//                entity.Property(e => e.Role).HasMaxLength(20);

//                entity.HasOne(d => d.Institution)
//                    .WithMany(p => p.Users)
//                    .HasForeignKey(d => d.InstitutionId)
//                    .HasConstraintName("FK__Users__Instituti__2A4B4B5E");
//            });

//            OnModelCreatingPartial(modelBuilder);
//        }

//        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
//    }
//}
