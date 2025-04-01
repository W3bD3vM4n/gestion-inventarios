using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using Transacciones.Services.Dto;

namespace Transacciones.Services.Services
{
    public class ProductoService : IProductoService
    {
        private const string ProductosApiUrl = "https://localhost:7086/api/Producto";

        private readonly HttpClient _httpClient;
        private readonly string _productoApiUrl;

        public ProductoService(HttpClient httpClient, IConfiguration configuracion)
        {
            _httpClient = httpClient;
            _productoApiUrl = configuracion["ProductoApiUrl"] ?? ProductosApiUrl;
        }


        public async Task<ProductoDto?> ObtenerPorIdAsync(int id)
        {
            try
            {
                Console.WriteLine($"Obtener producto con ID: {id} de {_productoApiUrl}/{id}");

                var respuesta = await _httpClient.GetFromJsonAsync<ProductoDto>($"{_productoApiUrl}/{id}");

                if (respuesta != null)
                {
                    Console.WriteLine($"Producto obtenido: {respuesta.Nombre}, Precio: {respuesta.Precio}");
                }

                return respuesta;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"Error al obtener producto: {ex.Message}");
                return null;
            }
        }
    }
}
