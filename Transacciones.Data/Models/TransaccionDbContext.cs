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
        modelBuilder.Entity<Transaccion>().ToTable("Transaccion", "dbo")
            .Property(t => t.PrecioUnitario)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Transaccion>()
            .Property(t => t.PrecioTotal)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<TipoTransaccion>().ToTable("TipoTransaccion", "dbo");
    }
}
