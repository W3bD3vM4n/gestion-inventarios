using Microsoft.EntityFrameworkCore;
using Productos.Data.Models;
using Productos.Services.Dto;
using Transacciones.Services.Dto;

namespace Productos.Services.Services
{
    public class ProductoService
    {
        private readonly ProductoDbContext _productoDbContext;

        public ProductoService(ProductoDbContext dbContext)
        {
            _productoDbContext = dbContext;
        }

        
        public async Task<List<ProductoResponse>> ObtenerTodosLosProductosAsync(
            string? nombreFilter = null,
            int? categoriaIdFilter = null,
            decimal? precioMinFilter = null,
            decimal? precioMaxFilter = null) // Agrega más filtros de ser necesario
        {
            try
            {
                // Empieza con IQueryable para crear busquedas dinámicas
                var query = _productoDbContext.Productos
                                            .Include(p => p.Categoria) // Carga pronta de Categoria
                                            .AsQueryable();

                // Aplica filtros condicionalmente
                if (!string.IsNullOrWhiteSpace(nombreFilter))
                {
                    query = query.Where(p => p.Nombre.Contains(nombreFilter));
                }

                if (categoriaIdFilter.HasValue)
                {
                    query = query.Where(p => p.CategoriaId == categoriaIdFilter.Value);
                }

                if (precioMinFilter.HasValue)
                {
                    query = query.Where(p => p.Precio >= precioMinFilter.Value);
                }

                if (precioMaxFilter.HasValue)
                {
                    query = query.Where(p => p.Precio <= precioMaxFilter.Value);
                }

                // Ejecuta la busqueda DESPUES de aplicar los filtros
                var productos = await query.ToListAsync();

                // Mapea a response DTO (Considera usar AutoMapper o Select para mayor eficiencia)
                var productoResponses = productos.Select(producto => new ProductoResponse()
                {
                    Id = producto.Id,
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion,
                    CategoriaId = producto.CategoriaId,
                    Categoria = producto.Categoria?.Nombre, // Comprueba null por seguridad
                    Imagen = producto.Imagen,
                    Precio = producto.Precio,
                    Stock = producto.Stock
                }).ToList();

                return productoResponses;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo productos: {ex.Message}");
                throw;
            }
        }


        public async Task<ProductoResponse?> ObtenerProductoPorIdAsync(int id)
        {
            try
            {
                var producto = await _productoDbContext.Productos
                    .Include(p => p.Categoria) // Incluye la información de Categoria
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (producto == null)
                {
                    return null; // Regresa null si no lo encuentra
                }

                // Mapea a response DTO
                var productoResponse = new ProductoResponse()
                {
                    Id = producto.Id,
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion,
                    CategoriaId = producto.CategoriaId,
                    Categoria = producto.Categoria?.Nombre, // Comprueba null por seguridad
                    Imagen = producto.Imagen,
                    Precio = producto.Precio,
                    Stock = producto.Stock
                };

                return productoResponse;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo el producto por ID {id}: {ex.Message}");
                throw;
            }
        }

        public async Task<List<Categoria>> ObtenerTodasLasCategoriasAsync()
        {
            try
            {
                var categorias = await _productoDbContext.Categorias.ToListAsync();
                return categorias;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error obteniendo categorias: {ex.Message}");
                throw;
            }
        }


        public async Task<Producto> CrearProductoAsync(ProductoCreateRequest peticion)
        {
            try
            {
                var producto = new Producto()
                {
                    Nombre = peticion.Nombre,
                    Descripcion = peticion.Descripcion,
                    CategoriaId = peticion.CategoriaId,
                    Imagen = peticion.Imagen,
                    Precio = peticion.Precio,
                    Stock = peticion.Stock
                };

                _productoDbContext.Productos.Add(producto);
                await _productoDbContext.SaveChangesAsync();

                return producto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creando el producto: {ex.Message}");
                throw;
            }
        }


        public async Task<Producto?> ActualizarProductoAsync(ProductoUpdateRequest peticion)
        {
            try
            {
                var producto = await _productoDbContext.Productos
                    .FirstOrDefaultAsync(x => x.Id == peticion.Id);

                if (producto == null)
                {
                    return null; // Regresa null si no lo encuentra
                }

                // Actualiza propiedades
                producto.Nombre = peticion.Nombre;
                producto.Descripcion = peticion.Descripcion;
                producto.CategoriaId = peticion.CategoriaId;
                producto.Imagen = peticion.Imagen;
                producto.Precio = peticion.Precio;
                producto.Stock = peticion.Stock;

                await _productoDbContext.SaveChangesAsync();
                return producto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error actualizando el producto {peticion.Id}: {ex.Message}");
                throw;
            }
        }

        public async Task<Producto> ActualizarStockAsync(StockUpdateRequest peticion)
        {
            var producto = await _productoDbContext.Productos
                .FirstOrDefaultAsync(x => x.Id == peticion.ProductoId);

            if (producto == null)
            {
                return null; // Regresa null si no lo encuentra
            }

            // Incrementa o decrementa el stock basado en el tipo de transacción
            if (peticion.EsIncremento)
            {
                producto.Stock += peticion.Cantidad;
            }
            else
            {
                // Verifica si hay suficiente stock para la venta
                if (producto.Stock < peticion.Cantidad)
                {
                    throw new InvalidOperationException("Stock insuficiente para la venta");
                }   

                producto.Stock -= peticion.Cantidad;
            }

            await _productoDbContext.SaveChangesAsync();
            return producto;
        }


        // TODO: Agregar verificación para transacciones existentes antes de permitir la eliminación
        public async Task<Producto?> EliminarProductoAsync(int id)
        {
            // IMPORTANTE: Agregue lógica aquí para llamar al servicio de Transacciones
            // para comprobar si existen transacciones para este ID de producto.
            // Si existen, devuelva un valor nulo o genere una excepción indicando que
            // no se permite la eliminación.

            try
            {
                var producto = await _productoDbContext.Productos
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (producto == null)
                {
                    return null; // Regresa null si no lo encuentra
                }

                _productoDbContext.Productos.Remove(producto); // Usa metodo Remove
                await _productoDbContext.SaveChangesAsync();

                return producto;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error borrando el producto {id}: {ex.Message}");
                throw;
            }
        }
    }
}
