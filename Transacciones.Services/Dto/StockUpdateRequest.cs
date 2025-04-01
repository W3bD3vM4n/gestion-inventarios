using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Transacciones.Services.Dto
{
    public class StockUpdateRequest
    {
        public int ProductoId { get; set; }
        public int Cantidad { get; set; }
        public bool EsIncremento { get; set; }
    }
}
