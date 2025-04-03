using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Transacciones.Services.Dto
{
    public class TransaccionUpdateRequest
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("fecha")]
        public DateTime Fecha { get; set; }

        [JsonPropertyName("tipoTransaccionId")]
        public int TipoTransaccionId { get; set; }

        [JsonPropertyName("productoId")]
        public int ProductoId { get; set; }

        [JsonPropertyName("cantidad")]
        public int Cantidad { get; set; }

        [JsonPropertyName("precioUnitario")]
        public decimal PrecioUnitario { get; set; }

        [JsonPropertyName("precioTotal")]
        public decimal PrecioTotal { get; set; }

        [JsonPropertyName("detalle")]
        public string? Detalle { get; set; }
    }
}
