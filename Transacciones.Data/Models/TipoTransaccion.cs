using System;
using System.Collections.Generic;

namespace Transacciones.Data.Models;

public partial class TipoTransaccion
{
    public int Id { get; set; }

    public string Tipo { get; set; } = null!;

    public virtual ICollection<Transaccion> Transaccions { get; set; } = new List<Transaccion>();
}
