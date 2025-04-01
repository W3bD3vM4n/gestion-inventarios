using Microsoft.AspNetCore.Mvc;
using Transacciones.Services.Dto;
using Productos.Services.Dto;
using Productos.Services.Services;
using Newtonsoft.Json;

namespace Productos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly ProductoService _productoService;

        public ProductoController(ProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpGet]
        public ActionResult Obtener()
        {
            var productos = _productoService.ObtenerTodos();

            if (!productos.Any())
            {
                return NotFound();
            }

            return Ok(productos);
        }

        [HttpGet("{id}")]
        public ActionResult<ProductoDto> PorId(int id)
        {
            var producto = _productoService.ObtenerPorId(id);

            if (producto == null)
            {
                return NotFound();
            }

            return Ok(producto);
        }

        [HttpGet("Categorias")]
        public IActionResult ObtenerCategorias()
        {
            try
            {
                var categorias = _productoService.ObtenerTodosCategorias();
                return Ok(categorias);
            }
            catch (Exception)
            {
                return StatusCode(500, "Error al obtener categorías");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] ProductoCreateRequest peticion)
        {
            Console.WriteLine(JsonConvert.SerializeObject(peticion));

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (peticion == null)
            {
                return BadRequest("Datos de producto invalidos");
            }

            var producto = await _productoService.AgregarAsync(peticion);

            if (producto == null)
            {
                return StatusCode(500, "Error al crear el producto");
            }

            return CreatedAtAction(nameof(PorId), new { id = producto.Id }, producto);
        }

        [HttpPut]
        public ActionResult Refrescar(ProductoUpdateRequest peticion)
        {
            return Ok(_productoService.Actualizar(peticion));
        }

        [HttpPut("stock")]
        public async Task<IActionResult> ActualizarStock([FromBody] StockUpdateRequest peticion)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var producto = await _productoService.ActualizarStockAsync(peticion);
                if (producto == null)
                    return NotFound("Producto no encontrado");

                return Ok(producto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
