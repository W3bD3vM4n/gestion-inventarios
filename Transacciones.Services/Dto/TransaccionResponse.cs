using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Transacciones.Services.Dto
{
    public class TransaccionResponse
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("fecha")]
        public DateTime Fecha { get; set; }

        [JsonPropertyName("tipo_transaccion")]
        public string TipoTransaccion { get; set; }

        [JsonPropertyName("producto_id")]
        public int ProductoId { get; set; }

        [JsonPropertyName("cantidad")]
        public int Cantidad { get; set; }

        [JsonPropertyName("precio_unitario")]
        public decimal PrecioUnitario { get; set; }

        [JsonPropertyName("precio_total")]
        public decimal PrecioTotal { get; set; }

        [JsonPropertyName("detalle")]
        public string? Detalle { get; set; }
    }
}
