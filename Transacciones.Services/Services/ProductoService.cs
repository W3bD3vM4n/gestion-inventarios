using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;
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
            _productoApiUrl = configuracion["ProductoApiUrl"] ?? ProductosApiUrl; // Regresa la constante si no está en la configuración
        }

        public async Task<ProductoDto?> ObtenerPorIdAsync(int id)
        {
            Console.WriteLine($"Obtener producto con ID: {id} de {_productoApiUrl}/api/productos/{id}");

            var respuesta = await _httpClient.GetAsync($"{_productoApiUrl}/api/productos/{id}");

            if (!respuesta.IsSuccessStatusCode)
            {
                Console.WriteLine($"Producto API error: {respuesta.StatusCode}");
                return null;
            }

            var producto = await respuesta.Content.ReadFromJsonAsync<ProductoDto>();

            if (producto == null)
            {
                Console.WriteLine($"Producto API regreso null por ID: {id}");
            }
            else
            {
                Console.WriteLine($"Producto obtenido: {producto.Nombre}, Precio: {producto.Precio}");
            }

            return producto;
        }
    }
}
