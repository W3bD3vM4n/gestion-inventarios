using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Transacciones.Data.Models;

public partial class TipoTransaccion
{
    [Column("id")]
    public int Id { get; set; }

    [Column("tipo")]
    public string? Tipo { get; set; }

    public virtual ICollection<Transaccion> Transacciones { get; set; } = new List<Transaccion>();
}
