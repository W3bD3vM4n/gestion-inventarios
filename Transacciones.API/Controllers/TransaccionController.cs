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
        public IActionResult ObtenerTodo()
        {
            var transacciones = _transaccionService.ObtenerTodasLasTransacciones();

            if (!transacciones.Any())
            {
                return NotFound();
            }

            return Ok(transacciones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            var transaccion = _transaccionService.ObtenerTransaccionPorId(id);

            if (transaccion == null)
            {
                return NotFound();
            }

            // Obtener detalles de ProductosService mediante una llamada HTTP
            var producto = await _productoService.ObtenerPorIdAsync(transaccion.ProductoId);

            return Ok(new
            {
                transaccion.Id,
                transaccion.Fecha,
                TipoTransaccion = transaccion.TipoTransaccion,
                Producto = producto,
                transaccion.Cantidad,
                transaccion.PrecioTotal
            });
        }


        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] TransaccionCreateRequest peticion)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var transaccion = await _transaccionService.CrearTransaccionAsync(peticion);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = transaccion.Id }, transaccion);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPut]
        public ActionResult Actualizar(TransaccionUpdateRequest peticion)
        {
            return Ok(_transaccionService.ActualizarTransaccion(peticion));
        }


        [HttpDelete("{id}")]
        public ActionResult Eliminar(int id)
        {
            bool ocurrioUnError = false;

            _transaccionService.EliminarTransaccion(id);

            if (ocurrioUnError)
            {
                return BadRequest();
            }

            return NoContent();
        }
    }
}
