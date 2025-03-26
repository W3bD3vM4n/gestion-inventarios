using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Transacciones.Data.Models;

public partial class Transaccion
{
    [Column("id")]
    public int Id { get; set; }

    [Column("fecha")]
    public DateTime Fecha { get; set; }

    [Column("tipo_transaccion_id")]
    public int TipoTransaccionId { get; set; }

    [Column("producto_id")]
    public int ProductoId { get; set; }

    [Column("cantidad")]
    public int Cantidad { get; set; }

    [Column("precio_unitario")]
    public decimal PrecioUnitario { get; set; }

    [Column("precio_total")]
    public decimal PrecioTotal { get; set; }

    [Column("detalle")]
    public string? Detalle { get; set; }

    public virtual TipoTransaccion TipoTransaccion { get; set; } = null!;
}
