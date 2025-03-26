using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Transacciones.Data.Models;

public partial class TransaccionDbContext : DbContext
{
    public TransaccionDbContext()
    {
    }

    public TransaccionDbContext(DbContextOptions<TransaccionDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Transaccion> Transacciones { get; set; } = null!;
    public virtual DbSet<TipoTransaccion> TipoTransacciones { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Transaccion>().ToTable("Transaccion", "dbo");
        modelBuilder.Entity<TipoTransaccion>().ToTable("TipoTransaccion", "dbo");
    }
}
