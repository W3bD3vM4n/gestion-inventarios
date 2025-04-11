using Microsoft.AspNetCore.Mvc;
using Transacciones.Data.Models;
using Transacciones.Services.Dto;
using Transacciones.Services.Services;

namespace Transacciones.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransaccionController : ControllerBase
    {
        private readonly TransaccionService _transaccionService;
        private readonly ILogger<TransaccionController> _logger;

        public TransaccionController(TransaccionService transaccionService, ILogger<TransaccionController> logger)
        {
            _transaccionService = transaccionService;
            _logger = logger;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransaccionResponse>>> ObtenerTodo(
            [FromQuery] DateTime? fechaInicio = null,
            [FromQuery] DateTime? fechaFin = null,
            [FromQuery] int? tipoTransaccionId = null,
            [FromQuery] int? productoId = null)
        {
            try
            {
                _logger.LogInformation("Obteniendo todas las transacciones con filtros: FechaInicio={FechaInicio}, FechaFin={FechaFin}, TipoId={TipoId}, ProductoId={ProductoId}",
                    fechaInicio, fechaFin, tipoTransaccionId, productoId);

                var transacciones = await _transaccionService.ObtenerTodasLasTransaccionesAsync(fechaInicio, fechaFin, tipoTransaccionId, productoId);
                
                return Ok(transacciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas las transacciones");
                return StatusCode(500, "Ocurrió un error interno al obtener las transacciones");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransaccionResponse>> ObtenerPorId(int id)
        {
            try
            {
                _logger.LogInformation("Obteniendo transacción por ID: {Id}", id);
                var transaccion = await _transaccionService.ObtenerTransaccionPorIdAsync(id);

                if (transaccion == null)
                {
                    _logger.LogWarning("Transacción con ID {Id} no encontrada", id);
                    return NotFound($"Transacción con ID {id} no encontrada");
                }

                return Ok(transaccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener la transacción con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al obtener la transacción");
            }
        }

        [HttpGet("TipoTransacciones")]
        public async Task<ActionResult<IEnumerable<TipoTransaccion>>> ObtenerTipo()
        {
            try
            {
                _logger.LogInformation("Obteniendo tipos de transacción");
                var tipos = await _transaccionService.ObtenerTipoTransaccionesAsync();
                return Ok(tipos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener los tipos de transacción");
                return StatusCode(500, "Ocurrió un error interno al obtener los tipos de transacción");
            }
        }


        [HttpPost]
        public async Task<ActionResult<Transaccion>> Crear([FromBody] TransaccionCreateRequest peticion)
        {
            if (peticion == null)
            {
                return BadRequest("La petición no puede ser nula.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation("Creando nueva transacción para ProductoId: {ProductoId}", peticion.ProductoId);
                var transaccion = await _transaccionService.CrearTransaccionAsync(peticion);

                // Suponiendo que ahora el servicio lanza una excepción en caso de falla,
                // no es necesario verificar estrictamente si el retorno es nulo
                // Si el servicio "puede" devolver nulo en caso de no ser una excepción, verificar:
                //if (transaccion == null)
                //{
                //    return StatusCode(500, "Error no especificado al crear la transacción");
                //}

                _logger.LogInformation("Transacción creada con ID: {Id}", transaccion.Id);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = transaccion.Id }, transaccion);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning("Error de operación al crear la transacción: {ErrorMessage}", ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error inesperado al crear la transacción");
                return StatusCode(500, $"Ocurrió un error interno al crear la transacción: {ex.Message}");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] TransaccionUpdateRequest peticion)
        {
            if (peticion == null)
            {
                return BadRequest("La petición no puede ser nula");
            }

            if (id != peticion.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del cuerpo");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                _logger.LogInformation("Actualizando transacción con ID: {Id}", id);
                var transaccionActualizada = await _transaccionService.ActualizarTransaccionAsync(peticion);

                if (transaccionActualizada == null)
                {
                    _logger.LogWarning("Transacción con ID {Id} no encontrada durante la actualización", id);
                    return NotFound($"Transacción con ID {id} no encontrada");
                }

                _logger.LogInformation("Transacción con ID: {Id} actualizada exitosamente", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar la transacción con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al actualizar la transacción");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                _logger.LogInformation("Eliminando transacción con ID: {Id}", id);
                var transaccionEliminada = await _transaccionService.EliminarTransaccionAsync(id);

                if (transaccionEliminada == null)
                {
                    _logger.LogWarning("Transacción con ID {Id} no encontrada durante la eliminación", id);
                    return NotFound($"Transacción con ID {id} no encontrada");
                }

                _logger.LogInformation("Transacción con ID: {Id} eliminada exitosamente", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar la transacción con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al eliminar la transacción");
            }
        }
    }
}
