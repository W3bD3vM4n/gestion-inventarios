using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Transacciones.Data.Models;
using Transacciones.Services.Dto;

namespace Transacciones.Services.Services
{
    public class TransaccionService
    {
        private readonly TransaccionDbContext _transaccionDbContext;

        public TransaccionService(TransaccionDbContext dbContext)
        {
            _transaccionDbContext = dbContext;
        }

        public List<TransaccionResponse> ObtenerTodos()
        {
            try
            {
                var transacciones = _transaccionDbContext.Transacciones.ToList();

                List<TransaccionResponse> transaccionResponses = new List<TransaccionResponse>();

                foreach (var transaccion in transacciones)
                {
                    transaccionResponses.Add(new TransaccionResponse() {
                        Id = transaccion.Id,
                        Fecha = transaccion.Fecha,
                        TipoTransaccion = transaccion.TipoTransaccion.Tipo,
                        ProductoId = transaccion.ProductoId,
                        Cantidad = transaccion.Cantidad,
                        PrecioUnitario = transaccion.PrecioUnitario,
                        PrecioTotal = transaccion.PrecioTotal,
                        Detalle = transaccion.Detalle
                    });
                }

                return transaccionResponses;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public TransaccionResponse ObtenerPorId(int id)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == id);

                var transaccionResponse = new TransaccionResponse()
                {
                    Id = transaccion.Id,
                    Fecha = transaccion.Fecha,
                    TipoTransaccion = transaccion.TipoTransaccion.Tipo,
                    ProductoId = transaccion.ProductoId,
                    Cantidad = transaccion.Cantidad,
                    PrecioUnitario = transaccion.PrecioUnitario,
                    PrecioTotal = transaccion.PrecioTotal,
                    Detalle = transaccion.Detalle
                };

                return transaccionResponse;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Transaccion Agregar(TransaccionCreateRequest peticion)
        {
            try
            {
                var transaccion = new Transaccion()
                {
                    Fecha = peticion.Fecha,
                    TipoTransaccionId = peticion.TipoTransaccionId,
                    ProductoId= peticion.ProductoId,
                    Cantidad= peticion.Cantidad,
                    PrecioUnitario= peticion.PrecioUnitario,
                    PrecioTotal= peticion.PrecioTotal,
                    Detalle= peticion.Detalle
                };

                _transaccionDbContext.Transacciones.Add(transaccion);
                _transaccionDbContext.SaveChanges();

                return transaccion;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Transaccion Actualizar(TransaccionUpdateRequest peticion)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == peticion.Id);

                transaccion.Fecha = peticion.Fecha;
                transaccion.TipoTransaccionId = peticion.TipoTransaccionId;
                transaccion.ProductoId = peticion.ProductoId;
                transaccion.Cantidad = peticion.Cantidad;
                transaccion.PrecioUnitario = peticion.PrecioUnitario;
                transaccion.PrecioTotal = peticion.PrecioTotal;
                transaccion.Detalle = peticion.Detalle;

                _transaccionDbContext.SaveChanges();

                return transaccion;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Transaccion? Eliminar(int id)
        {
            try
            {
                var transaccion = _transaccionDbContext.Transacciones
                    .FirstOrDefault(x => x.Id == id);

                _transaccionDbContext.Remove(transaccion);
                _transaccionDbContext.SaveChanges();

                return transaccion;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
