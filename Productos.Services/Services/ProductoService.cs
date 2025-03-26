using Productos.Data.Models;
using Productos.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Productos.Services.Services
{
    public class ProductoService
    {
        private readonly ProductoDbContext _productoDbContext;

        public ProductoService(ProductoDbContext dbContext)
        {
            _productoDbContext = dbContext;
        }

        public List<ProductoResponse> ObtenerTodos()
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

        public ProductoResponse ObtenerPorId(int id)
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

        public Producto Agregar(ProductoCreateRequest peticion)
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
                _productoDbContext.SaveChanges();

                return producto;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Producto Actualizar(ProductoUpdateRequest peticion)
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

        public Producto? Eliminar(int id)
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
