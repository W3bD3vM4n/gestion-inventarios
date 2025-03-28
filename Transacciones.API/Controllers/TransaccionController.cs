using Microsoft.AspNetCore.Mvc;
using Transacciones.Services.Dto;
using Transacciones.Services.Services;

namespace Transacciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransaccionController : ControllerBase
    {
        private readonly IProductoService _productoService;
        private readonly TransaccionService _transaccionService;

        public TransaccionController(IProductoService productoService, TransaccionService transaccionService)
        {
            _productoService = productoService;
            _transaccionService = transaccionService;
        }

        [HttpGet]
        public ActionResult Obtener()
        {
            var transacciones = _transaccionService.ObtenerTodos();

            if (!transacciones.Any())
            {
                return NotFound();
            }

            return Ok(transacciones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> PorId(int id)
        {
            var transaccion = _transaccionService.ObtenerPorId(id);

            if (transaccion == null)
            {
                return NotFound();
            }

            // Obtener detalles de ProductosService mediante una llamada HTTP
            var producto = await _productoService.ObtenerPorIdAsync(transaccion.ProductoId);

            var respuesta = new
            {
                transaccion.Id,
                transaccion.Fecha,
                transaccion.TipoTransaccion,
                Producto = producto,  // Une detalles del Producto
                transaccion.Cantidad,
                transaccion.PrecioTotal
            };

            return Ok(respuesta);
        }

        [HttpPost]
        public ActionResult Crear(TransaccionCreateRequest peticion)
        {
            return Ok(_transaccionService.Agregar(peticion));
        }

        [HttpPut]
        public ActionResult Refrescar(TransaccionUpdateRequest peticion)
        {
            return Ok(_transaccionService.Actualizar(peticion));
        }

        [HttpDelete("{id}")]
        public ActionResult Borrar(int id)
        {
            bool ocurrioUnError = false;

            _transaccionService.Eliminar(id);

            if (ocurrioUnError)
            {
                return BadRequest();
            }

            return NoContent();
        }
    }
}
