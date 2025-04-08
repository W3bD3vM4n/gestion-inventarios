using System.Text.Json.Serialization;

namespace Productos.Services.Dto
{
    public class ProductoCreateRequest
    {
        [JsonPropertyName("nombre")]
        public string Nombre { get; set; }

        [JsonPropertyName("descripcion")]
        public string? Descripcion { get; set; }

        [JsonPropertyName("categoriaId")]
        public int CategoriaId { get; set; }

        [JsonPropertyName("imagen")]
        public string? Imagen { get; set; }

        [JsonPropertyName("precio")]
        public decimal Precio { get; set; }

        [JsonPropertyName("stock")]
        public int Stock { get; set; }
    }
}
