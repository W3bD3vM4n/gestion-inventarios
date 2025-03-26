using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Productos.Data.Models;

public partial class ProductoDbContext : DbContext
{
    public ProductoDbContext()
    {
    }

    public ProductoDbContext(DbContextOptions<ProductoDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Producto> Productos { get; set; } = null!;
    public virtual DbSet<Categoria> Categorias { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>().ToTable("Producto", "dbo");
        modelBuilder.Entity<Categoria>().ToTable("Categoria", "dbo");
    }
}
