using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Productos.Data.Models;

public partial class Producto
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nombre")]
    public string Nombre { get; set; } = null!;

    [Column("descripcion")]
    public string? Descripcion { get; set; }

    [Column("categoria_id")]
    public int CategoriaId { get; set; }

    [Column("imagen")]
    public string? Imagen { get; set; }

    [Column("precio")]
    public decimal Precio { get; set; }

    [Column("stock")]
    public int Stock { get; set; }

    public virtual Categoria Categoria { get; set; } = null!;
}
