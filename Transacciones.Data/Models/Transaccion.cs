using System;
using System.Collections.Generic;

namespace Transacciones.Data.Models;

public partial class Transaccion
{
    public int Id { get; set; }

    public DateTime Fecha { get; set; }

    public int TipoTransaccionId { get; set; }

    public int ProductoId { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal PrecioTotal { get; set; }

    public string? Detalle { get; set; }

    public virtual TipoTransaccion TipoTransaccion { get; set; } = null!;
}
