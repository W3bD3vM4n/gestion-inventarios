using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transacciones.Services.Dto;

namespace Transacciones.Services.Services
{
    public interface IProductoService
    {
        Task<ProductoDto?> ObtenerPorIdAsync(int id);
    }
}
