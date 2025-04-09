using Microsoft.AspNetCore.Mvc;
using Transacciones.Services.Dto;
using Transacciones.Services.Services;

namespace Transacciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransaccionController : ControllerBase
    {
        private readonly TransaccionService _transaccionService;

        public TransaccionController(IProductoService productoService, TransaccionService transaccionService)
        {
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
        public IActionResult ObtenerPorId(int id)
        {
            var transaccion = _transaccionService.ObtenerTransaccionPorId(id);

            if (transaccion == null)
            {
                return NotFound();
            }

            return Ok(transaccion);
        }

        [HttpGet("TipoTransacciones")]
        public IActionResult ObtenerTipo()
        {
            try
            {
                var tipos = _transaccionService.ObtenerTipoTransacciones();
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
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
