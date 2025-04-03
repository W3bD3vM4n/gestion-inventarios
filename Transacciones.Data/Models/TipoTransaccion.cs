namespace Transacciones.Data.Models;

public partial class TipoTransaccion
{
    public int Id { get; set; }
    
    public string? Tipo { get; set; }

    public virtual ICollection<Transaccion> Transacciones { get; set; } = new List<Transaccion>();
}
