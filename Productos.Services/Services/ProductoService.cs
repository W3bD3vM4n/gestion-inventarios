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


        public List<ProductoResponse> ObtenerTodosLosProductos()
        {
            try
            {
                var productos = _productoDbContext.Productos.ToList();

                List<ProductoResponse> productoResponses = new List<ProductoResponse>();

                foreach (var producto in productos)
                {
                    productoResponses.Add(new ProductoResponse()
                    {
                        Id = producto.Id,
                        Nombre = producto.Nombre,
                        Descripcion = producto.Descripcion,
                        Categoria = producto.Categoria.Nombre,
                        Imagen = producto.Imagen,
                        Precio = producto.Precio,
                        Stock = producto.Stock
                    });
                }

                return productoResponses;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public ProductoResponse ObtenerProductoPorId(int id)
        {
            try
            {
                var producto = _productoDbContext.Productos
                    .FirstOrDefault(x => x.Id == id);

                var productoResponse = new ProductoResponse()
                {
                    Id = producto.Id,
                    Nombre = producto.Nombre,
                    Descripcion = producto.Descripcion,
                    Categoria = producto.Categoria.Nombre,
                    Imagen = producto.Imagen,
                    Precio = producto.Precio,
                    Stock = producto.Stock
                };

                return productoResponse;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public List<Categoria> ObtenerTodasLasCategorias()
        {
            try
            {
                var categorias = _productoDbContext.Categorias.ToList();
                return categorias;
            }
            catch (Exception)
            {
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
                Console.WriteLine($"Error: {ex.Message}");
                throw;
            }
        }


        public Producto ActualizarProducto(ProductoUpdateRequest peticion)
        {
            try
            {
                var producto = _productoDbContext.Productos
                    .FirstOrDefault(x => x.Id == peticion.Id);

                producto.Nombre = peticion.Nombre;
                producto.Descripcion = peticion.Descripcion;
                producto.CategoriaId = peticion.CategoriaId;
                producto.Imagen = peticion.Imagen;
                producto.Precio = peticion.Precio;
                producto.Stock = peticion.Stock;

                _productoDbContext.SaveChanges();

                return producto;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<Producto> ActualizarStockAsync(StockUpdateRequest peticion)
        {
            var producto = await _productoDbContext.Productos
                .FirstOrDefaultAsync(x => x.Id == peticion.ProductoId);

            if (producto == null)
                return null;

            // Incrementar o decrementar el stock basado en el tipo de transacción
            if (peticion.EsIncremento)
            {
                producto.Stock += peticion.Cantidad;
            }
            else
            {
                // Verificar si hay suficiente stock para la venta
                if (producto.Stock < peticion.Cantidad)
                    throw new Exception("Stock insuficiente para realizar esta venta");

                producto.Stock -= peticion.Cantidad;
            }

            await _productoDbContext.SaveChangesAsync();
            return producto;
        }


        public Producto? EliminarProducto(int id)
        {
            try
            {
                var producto = _productoDbContext.Productos
                    .FirstOrDefault(x => x.Id == id);

                _productoDbContext.Remove(producto);
                _productoDbContext.SaveChanges();

                return producto;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
