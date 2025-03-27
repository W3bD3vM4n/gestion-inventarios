using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Productos.Data.Models;

public partial class Producto
{
    public int Id { get; set; }
    
    public string Nombre { get; set; } = null!;
    
    public string? Descripcion { get; set; }
    
    public int CategoriaId { get; set; }
    
    public string? Imagen { get; set; }
    
    public decimal Precio { get; set; }
    
    public int Stock { get; set; }

    public virtual Categoria Categoria { get; set; } = null!;
}
