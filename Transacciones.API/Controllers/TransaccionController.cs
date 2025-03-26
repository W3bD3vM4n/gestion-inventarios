using Microsoft.AspNetCore.Mvc;
using Transacciones.Services.Dto;
using Transacciones.Services.Services;

namespace Transacciones.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransaccionController : Controller
    {
        private readonly TransaccionService _transaccionService;

        public TransaccionController(TransaccionService transaccionService)
        {
            _transaccionService = transaccionService;
        }

        [HttpGet]
        public ActionResult Obtener()
        {
            var transaccion = _transaccionService.ObtenerTodos();

            if (!transaccion.Any())
            {
                return NotFound();
            }

            return Ok(transaccion);
        }

        [HttpGet("{id}")]
        public ActionResult PorId(int id)
        {
            var transaccion = _transaccionService.ObtenerPorId(id);

            if (transaccion == null)
            {
                return NotFound();
            }

            return Ok(transaccion);
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
