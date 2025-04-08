using System.Text.Json.Serialization;

namespace Transacciones.Services.Dto
{
    public class StockUpdateRequest
    {
        [JsonPropertyName("productoId")]
        public int ProductoId { get; set; }

        [JsonPropertyName("cantidad")]
        public int Cantidad { get; set; }

        [JsonPropertyName("esIncremento")]
        public bool EsIncremento { get; set; }
    }
}
