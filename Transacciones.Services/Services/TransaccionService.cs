using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using System.Net.Http;
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

        public TransaccionService(TransaccionDbContext dbContext)
        {
            _transaccionDbContext = dbContext;
        }

        public TransaccionService(
            TransaccionDbContext dbContext,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _transaccionDbContext = dbContext;
            _httpClient = httpClient;
            _productoApiUrl = configuration["ProductoApiUrl"]; // Esto viene de appsettings.json
        }

        public List<TransaccionResponse> ObtenerTodos()
        {
            try
            {
                var transacciones = _transaccionDbContext.Transacciones.ToList();

                List<TransaccionResponse> transaccionResponses = new List<TransaccionResponse>();

                foreach (var transaccion in transacciones)
                {
                    transaccionResponses.Add(new TransaccionResponse() {
                        Id = transaccion.Id,
                        Fecha = transaccion.Fecha,
                        TipoTransaccion = transaccion.TipoTransaccion.Tipo,
                        ProductoId = transaccion.ProductoId,
                        Cantidad = transaccion.Cantidad,
                        PrecioUnitario = transaccion.PrecioUnitario,
                        PrecioTotal = transaccion.PrecioTotal,
                        Detalle = transaccion.Detalle
                    });
                }

                return transaccionResponses;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public TransaccionResponse ObtenerPorId(int id)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == id);

                var transaccionResponse = new TransaccionResponse()
                {
                    Id = transaccion.Id,
                    Fecha = transaccion.Fecha,
                    TipoTransaccion = transaccion.TipoTransaccion.Tipo,
                    ProductoId = transaccion.ProductoId,
                    Cantidad = transaccion.Cantidad,
                    PrecioUnitario = transaccion.PrecioUnitario,
                    PrecioTotal = transaccion.PrecioTotal,
                    Detalle = transaccion.Detalle
                };

                return transaccionResponse;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Transaccion> AgregarAsync(TransaccionCreateRequest peticion)
        {
            try
            {
                // Si es una venta, verificar stock disponible primero
                if (peticion.TipoTransaccionId == 2) // el ID para ventas es 2
                {
                    // Obtener información del producto
                    var response = await _httpClient.GetAsync($"{_productoApiUrl}/api/Producto/{peticion.ProductoId}");

                    if (!response.IsSuccessStatusCode)
                        throw new Exception("No se pudo verificar el producto");

                    var productoJson = await response.Content.ReadAsStringAsync();
                    var producto = JsonConvert.DeserializeObject<ProductoDto>(productoJson);

                    if (producto.Stock < peticion.Cantidad)
                        throw new Exception("Stock insuficiente para esta venta");
                }

                // Calcular precio total
                peticion.PrecioTotal = peticion.Cantidad * peticion.PrecioUnitario;

                // Crear la transacción
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

                // Actualizar el stock del producto
                await ActualizarStockProducto(
                    peticion.ProductoId,
                    peticion.Cantidad,
                    peticion.TipoTransaccionId == 1); // Asumiendo que 1 es el ID para compras

                return transaccion;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en transacción: {ex.Message}");
                throw;
            }
        }

        public Transaccion Actualizar(TransaccionUpdateRequest peticion)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == peticion.Id);

                transaccion.Fecha = peticion.Fecha;
                transaccion.TipoTransaccionId = peticion.TipoTransaccionId;
                transaccion.ProductoId = peticion.ProductoId;
                transaccion.Cantidad = peticion.Cantidad;
                transaccion.PrecioUnitario = peticion.PrecioUnitario;
                transaccion.PrecioTotal = peticion.PrecioTotal;
                transaccion.Detalle = peticion.Detalle;

                _transaccionDbContext.SaveChanges();

                return transaccion;
            }
            catch (Exception)
            {
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
                throw new Exception($"Error al actualizar stock: {errorMessage}");
            }
        }

        public Transaccion? Eliminar(int id)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == id);

                _transaccionDbContext.Remove(transaccion);
                _transaccionDbContext.SaveChanges();

                return transaccion;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
