using Microsoft.AspNetCore.Mvc;
using Transacciones.Services.Dto;
using Productos.Services.Dto;
using Productos.Services.Services;
using Newtonsoft.Json;
using Productos.Data.Models;
using Azure.Core;
using Transacciones.Data.Models;

namespace Productos.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly ProductoService _productoService;
        private readonly ILogger<ProductoController> _logger;

        public ProductoController(ProductoService productoService, ILogger<ProductoController> logger)
        {
            _productoService = productoService;
            _logger = logger;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoResponse>>> ObtenerTodo(
        [FromQuery] string? nombre = null,
        [FromQuery] int? categoriaId = null,
        [FromQuery] decimal? precioMin = null,
        [FromQuery] decimal? precioMax = null)
        {
            try
            {
                _logger.LogInformation("Obteniendo todos los productos con filtros: Nombre={Nombre}, CategoriaId={CategoriaId}, PrecioMin={PrecioMin}, PrecioMax={PrecioMax}",
                nombre, categoriaId, precioMin, precioMax);

                // Pasa los filtros al método de servicio
                var productos = await _productoService.ObtenerTodosLosProductosAsync(nombre, categoriaId, precioMin, precioMax);
                
                return Ok(productos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener todas los productos");
                return StatusCode(500, "Ocurrió un error interno al obtener los productos");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoResponse>> ObtenerPorId(int id)
        {
            try
            {
                _logger.LogInformation("Obteniendo producto por ID: {Id}", id);
                var producto = await _productoService.ObtenerProductoPorIdAsync(id);

                if (producto == null)
                {
                    _logger.LogWarning("Producto con ID {Id} no encontrado", id);
                    return NotFound($"Producto con ID {id} no encontrado");
                }

                return Ok(producto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener el producto con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al obtener el producto");
            }
        }

        [HttpGet("Categorias")]
        public async Task<ActionResult<IEnumerable<Categoria>>> ObtenerCategorias()
        {
            try
            {
                _logger.LogInformation("Obteniendo las categorías de productos");
                var categorias = await _productoService.ObtenerTodasLasCategoriasAsync();
                return Ok(categorias);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener las categorías de productos");
                return StatusCode(500, "Ocurrió un error interno al obtener las categorías");
            }
        }


        [HttpPost]
        public async Task<ActionResult<Producto>> Crear([FromBody] ProductoCreateRequest peticion)
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
                _logger.LogInformation("Creando un nuevo producto: {Producto}", JsonConvert.SerializeObject(peticion));
                var producto = await _productoService.CrearProductoAsync(peticion);

                _logger.LogInformation("Producto creado con ID: {Id}", producto.Id);
                return CreatedAtAction(nameof(ObtenerPorId), new { id = producto.Id }, producto);
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Error de operación al crear el producto: {ErrorMessage}", ex.Message);
                return StatusCode(500, "Ocurrió un error interno al crear el producto");
            }
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] ProductoUpdateRequest peticion)
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
                _logger.LogInformation("Actualizando producto con ID: {Id}", id);
                var productoActualizado = await _productoService.ActualizarProductoAsync(peticion);
                
                if (productoActualizado == null)
                {
                    _logger.LogWarning("Producto con ID {Id} no encontrado durante la actualización", id);
                    return NotFound($"Producto con ID {id} no encontrado");
                }

                _logger.LogInformation("Producto con ID: {Id} actualizado exitosamente", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar el producto con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al actualizar el producto");
            }
        }

        [HttpPut("Stock")]
        public async Task<IActionResult> ActualizarStock([FromBody] StockUpdateRequest peticion)
        {
            // Usar registro estructurado de parametros como {ProductoId} vuelve los campos más faciles de buscar
            _logger.LogInformation("Intentando actualizar el stock. ProductoId: {ProductoId}, Cantidad: {Cantidad}, EsIncremento: {EsIncremento}",
                peticion?.ProductoId,
                peticion?.Cantidad,
                peticion?.EsIncremento);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _productoService.ActualizarStockAsync(peticion);

                _logger.LogInformation("Actualización de stock exitoso para ProductoId: {ProductoId}", peticion.ProductoId);
                return Ok();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Violación de una regla de negocio durante la actualización de stock para ProductoId: {ProductoId}. Mensaje: {ErrorMessage}",
            peticion.ProductoId, ex.Message);
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Un error inesperado ocurrió al actualizar el stock del ProductoId: {ProductoId}", peticion.ProductoId);
                return StatusCode(500, "Ocurrió un error interno al actualizar el stock");
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                _logger.LogInformation("Eliminando producto con ID: {Id}", id);
                var productoEliminado = await _productoService.EliminarProductoAsync(id);

                if (productoEliminado == null)
                {
                    _logger.LogWarning("Producto con ID {Id} no encontrado durante la eliminación", id);
                    return NotFound($"Producto con ID {id} no encontrado");
                }

                _logger.LogInformation("Producto con ID: {Id} eliminado exitosamente", id);
                return Ok(productoEliminado);
            }
            // Captura una excepción específica si la eliminación está bloqueada por las transacciones
            //catch (InvalidOperationException ex)
            //{
            //    return BadRequest(ex.Message); 
            //}
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar el producto con ID {Id}", id);
                return StatusCode(500, "Ocurrió un error interno al eliminar el producto");
            }
        }
    }
}
