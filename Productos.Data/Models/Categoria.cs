using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Productos.Data.Models;

public partial class Categoria
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nombre")]
    public string? Nombre { get; set; }

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
