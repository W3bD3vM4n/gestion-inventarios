using Microsoft.AspNetCore.Mvc;
using Productos.Services.Dto;
using Productos.Services.Services;

namespace Productos.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : Controller
    {
        private readonly ProductoService _productoService;

        public ProductoController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        public ActionResult Obtener()
        {
            var producto = _productoService.ObtenerTodos();

            if (!producto.Any())
            {
                return NotFound();
            }

            return Ok(producto);
        }

        [HttpGet("{id}")]
        public ActionResult PorId(int id)
        {
            var producto = _productoService.ObtenerPorId(id);

            if (producto == null)
            {
                return NotFound();
            }

            return Ok(producto);
        }

        [HttpPost]
        public ActionResult Crear(ProductoCreateRequest peticion)
        {
            return Ok(_productoService.Agregar(peticion));
        }

        [HttpPut]
        public ActionResult Refrescar(ProductoUpdateRequest peticion)
        {
            return Ok(_productoService.Actualizar(peticion));
        }

        [HttpDelete("{id}")]
        public ActionResult Borrar(int id)
        {
            bool ocurrioUnError = false;

            _productoService.Eliminar(id);

            if (ocurrioUnError)
            {
                return BadRequest();
            }

            return NoContent();
        }
    }
}
