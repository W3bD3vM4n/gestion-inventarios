using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Text;
using Transacciones.Data.Models;
using Transacciones.Services.Dto;

namespace Transacciones.Services.Services
{
    public class TransaccionService
    {
        private readonly TransaccionDbContext _transaccionDbContext;
        private readonly HttpClient _httpClient;
        private readonly string _productoApiUrl;
        
        public TransaccionService(
            TransaccionDbContext dbContext,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _transaccionDbContext = dbContext;
            _httpClient = httpClient;
            // Se asegura que la URL que viene de appsettings.json este configurada
            _productoApiUrl = configuration["ProductoApiUrl"] ?? throw new ArgumentNullException("ProductoApiUrl not configured");
        }


        public async Task<List<TransaccionResponse>> ObtenerTodasLasTransaccionesAsync(
            DateTime? fechaInicio = null,
            DateTime? fechaFin = null,
            int? tipoTransaccionId = null,
            int? productoId = null) // Agrega más filtros de ser necesario
        {
            try
            {
                // Empieza con IQueryable
                var query = _transaccionDbContext.Transacciones
                                            .Include(t => t.TipoTransaccion) // Eager load Type
                                            .AsQueryable();

                // Aplica filtros condicionalmente
                if (fechaInicio.HasValue)
                {
                    // Asegura que el tiempo se gestione correctamente (inicio del día)
                    query = query.Where(t => t.Fecha >= fechaInicio.Value.Date);
                }

                if (fechaFin.HasValue)
                {
                    // Asegura que el tiempo se gestione correctamente (fin del día)
                    var fechaFinEndOfDay = fechaFin.Value.Date.AddDays(1).AddTicks(-1);
                    query = query.Where(t => t.Fecha <= fechaFinEndOfDay);
                }

                if (tipoTransaccionId.HasValue)
                {
                    query = query.Where(t => t.TipoTransaccionId == tipoTransaccionId.Value);
                }

                if (productoId.HasValue)
                {
                    query = query.Where(t => t.ProductoId == productoId.Value);
                }

                // Ejecuta la busqueda
                var transacciones = await query
                                        .OrderByDescending(t => t.Fecha) // Example sorting
                                        .ToListAsync();

                // Mapea a response DTO (Considera usar AutoMapper o Select)
                var transaccionResponses = transacciones.Select(transaccion => new TransaccionResponse()
                {
                    Id = transaccion.Id,
                    Fecha = transaccion.Fecha,
                    TipoTransaccionId = transaccion.TipoTransaccionId,
                    TipoTransaccion = transaccion.TipoTransaccion?.Tipo, // Comprueba null por seguridad
                    ProductoId = transaccion.ProductoId,
                    Cantidad = transaccion.Cantidad,
                    PrecioUnitario = transaccion.PrecioUnitario,
                    PrecioTotal = transaccion.PrecioTotal,
                    Detalle = transaccion.Detalle
                }).ToList();

                return transaccionResponses;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo transacciones: {ex.Message}");
                throw;
            }
        }

        public async Task<TransaccionResponse?> ObtenerTransaccionPorIdAsync(int id)
        {
            try
            {
                var transaccion = await _transaccionDbContext.Transacciones
                    .Include(t => t.TipoTransaccion)
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (transaccion == null)
                {
                    return null;
                }

                var transaccionResponse = new TransaccionResponse()
                {
                    Id = transaccion.Id,
                    Fecha = transaccion.Fecha,
                    TipoTransaccionId = transaccion.TipoTransaccionId,
                    TipoTransaccion = transaccion.TipoTransaccion?.Tipo,
                    ProductoId = transaccion.ProductoId,
                    Cantidad = transaccion.Cantidad,
                    PrecioUnitario = transaccion.PrecioUnitario,
                    PrecioTotal = transaccion.PrecioTotal,
                    Detalle = transaccion.Detalle
                };

                return transaccionResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo transacción {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<TipoTransaccion>> ObtenerTipoTransaccionesAsync()
        {
            try
            {
                return await _transaccionDbContext.TipoTransacciones.ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo tipos de transacción: {ex.Message}");
                throw;
            }
        }


        public async Task<Transaccion> CrearTransaccionAsync(TransaccionCreateRequest peticion)
        {
            try
            {
                // Define IDs como constantes
                const int tipoVentaId = 2;
                const int tipoCompraId = 1;

                // Si es una venta, verificar stock disponible primero
                if (peticion.TipoTransaccionId == tipoVentaId)
                {
                    // Obteniene la información del producto llamando a la API
                    var response = await _httpClient.GetAsync($"{_productoApiUrl}/api/Producto/{peticion.ProductoId}");

                    if (!response.IsSuccessStatusCode)
                    {
                        // Maneja códigos de estado específicos
                        throw new Exception($"No se pudo verificar el producto (Status: {response.StatusCode})");
                    }

                    var productoJson = await response.Content.ReadAsStringAsync();
                    // Se asegura que ProductoDto coincida con la estructura de response de Producto API
                    var producto = JsonConvert.DeserializeObject<ProductoDto>(productoJson);

                    if (producto == null)
                    {
                        throw new Exception($"Producto con ID {peticion.ProductoId} no encontrado o inválido");
                    }

                    if (producto.Stock < peticion.Cantidad)
                    {
                        throw new InvalidOperationException("Stock insuficiente para esta venta");
                    }
                }

                // Calcula el precio total
                peticion.PrecioTotal = peticion.Cantidad * peticion.PrecioUnitario;

                // Crea la transacción
                var transaccion = new Transaccion()
                {
                    Fecha = peticion.Fecha,
                    TipoTransaccionId = peticion.TipoTransaccionId,
                    ProductoId= peticion.ProductoId,
                    Cantidad= peticion.Cantidad,
                    PrecioUnitario= peticion.PrecioUnitario,
                    PrecioTotal= peticion.PrecioTotal,
                    Detalle= peticion.Detalle
                };

                _transaccionDbContext.Transacciones.Add(transaccion);
                await _transaccionDbContext.SaveChangesAsync();

                // Actualiza el stock del producto
                await ActualizarStockProducto(
                    peticion.ProductoId,
                    peticion.Cantidad,
                    peticion.TipoTransaccionId == tipoCompraId);

                return transaccion;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en transacción: {ex.Message}");
                throw;
            }
        }


        // ADVERTENCIA: La actualización de transacciones puede requerir revertir o ajustar los cambios de stock, lo cual es complejo
        // Considere si realmente es necesario editar las transacciones o si es mejor eliminarlas/re-crearlas
        public async Task<Transaccion?> ActualizarTransaccionAsync(TransaccionUpdateRequest peticion)
        {
            // TODO: Implementar la lógica para gestionar los ajustes de stock si se modifica una transacción
            // Esto puede ser complejo: ¿qué pasa si cambia la cantidad? ¿O el tipo?
            // Esto podría implicar revertir el cambio de stock original y aplicar el nuevo
            try
            {
                var transaccion = await _transaccionDbContext.Transacciones
                    .FirstOrDefaultAsync(x => x.Id == peticion.Id);

                if (transaccion == null)
                {
                    return null;
                }

                // Almacene valores antiguos si acaso se necesite para la lógica de ajuste de stock
                // int oldQuantity = transaccion.Cantidad;
                // int oldTipo = transaccion.TipoTransaccionId;

                // Actualizar propiedades
                transaccion.Fecha = peticion.Fecha;
                transaccion.TipoTransaccionId = peticion.TipoTransaccionId;
                transaccion.ProductoId = peticion.ProductoId; // Cambiar el producto podría requerir más lógica
                transaccion.Cantidad = peticion.Cantidad;
                transaccion.PrecioUnitario = peticion.PrecioUnitario;
                transaccion.PrecioTotal = peticion.PrecioTotal; // ¿Recalcular o confiar en la entrada?
                transaccion.Detalle = peticion.Detalle;

                await _transaccionDbContext.SaveChangesAsync();

                // TODO: Llamar a Producto API para ajustar el stock en función de la "diferencia"
                // entre el estado de la transacción anterior y el nuevo (esto no es trivial)

                return transaccion;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error actualizando la transacción {peticion.Id}: {ex.Message}");
                throw;
            }
        }

        private async Task ActualizarStockProducto(int productoId, int cantidad, bool esIncremento)
        {
            var stockUpdate = new StockUpdateRequest
            {
                ProductoId = productoId,
                Cantidad = cantidad,
                EsIncremento = esIncremento
            };

            var content = new StringContent(
                JsonConvert.SerializeObject(stockUpdate),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PutAsync($"{_productoApiUrl}/api/Producto/stock", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorMessage = await response.Content.ReadAsStringAsync();
                // Log (registro) del mensaje de error completo
                Console.WriteLine($"Error actualizando el stock para el producto {productoId}: Estado {response.StatusCode}, Mensaje: {errorMessage}");
                throw new Exception($"Error al actualizar stock del producto: {response.ReasonPhrase}");
            }
        }


        // ADVERTENCIA: La eliminación de transacciones idealmente debería revertir el cambio de stock
        public async Task<Transaccion?> EliminarTransaccionAsync(int id)
        {
            // TODO: Implementar la lógica para revertir el ajuste de stock al eliminar
            // Requiere obtener los detalles de la transacción "antes" de eliminar
            try
            {
                var transaccion = await _transaccionDbContext.Transacciones
                     .FirstOrDefaultAsync(x => x.Id == id);

                if (transaccion == null)
                {
                    return null;
                }

                // --- Logica para revertir stock ---
                // bool esIncrementoOriginal = transaccion.TipoTransaccionId == 1; // Compra?
                // await ActualizarStockProducto(transaccion.ProductoId, transaccion.Cantidad, !esIncrementoOriginal); // Efecto reverso
                // -----------------------------

                _transaccionDbContext.Transacciones.Remove(transaccion);
                await _transaccionDbContext.SaveChangesAsync();

                return transaccion;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error borrando la transacción {id}: {ex.Message}");
                // Considera si la reversión de stock falla: ¿cómo gestionarlo?
                // La transacción podría eliminarse, pero el stock permanece sin cambios
                throw;
            }
        }
    }
}
