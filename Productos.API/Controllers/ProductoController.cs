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
        public ActionResult ObtenerTodo()
        {
            var productos = _productoService.ObtenerTodosLosProductos();

            if (!productos.Any())
            {
                return NotFound();
            }

            return Ok(productos);
        }

        [HttpGet("{id}")]
        public ActionResult<ProductoDto> ObtenerPorId(int id)
        {
            var producto = _productoService.ObtenerProductoPorId(id);

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
                var categorias = _productoService.ObtenerTodasLasCategorias();
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

            var producto = await _productoService.CrearProductoAsync(peticion);

            if (producto == null)
            {
                return StatusCode(500, "Error al crear el producto");
            }

            return CreatedAtAction(nameof(ObtenerPorId), new { id = producto.Id }, producto);
        }


        [HttpPut("{id}")]
        public ActionResult Actualizar(int id, [FromBody] ProductoUpdateRequest peticion)
        {
            // Optional: Check if the id in the URL matches the id in the body, if peticion has an Id property
            if (id != peticion.Id)
            {
                return BadRequest("ID mismatch between URL and request body.");
            }

            // Assuming _productoService.ActualizarProducto uses the ID within the 'peticion' object
            // If it needs the ID passed separately, you might need to adjust the service call too.
            var productoActualizado = _productoService.ActualizarProducto(peticion); // Make sure 'peticion' contains the ID or adjust service

            if (productoActualizado == null)
            {
                // Or handle based on how your service indicates failure/not found
                return NotFound($"Producto con ID {id} no encontrado o no se pudo actualizar.");
            }

            return Ok(productoActualizado);
        }

        [HttpPut("Stock")]
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
        public ActionResult Eliminar(int id)
        {
            bool ocurrioUnError = false;

            _productoService.EliminarProducto(id);

            if (ocurrioUnError)
            {
                return BadRequest();
            }

            return NoContent();
        }
    }
}
