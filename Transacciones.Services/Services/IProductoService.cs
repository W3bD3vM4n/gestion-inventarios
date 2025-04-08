using Transacciones.Services.Dto;

namespace Transacciones.Services.Services
{
    public interface IProductoService
    {
        Task<ProductoDto?> ObtenerPorIdAsync(int id);
    }
}
