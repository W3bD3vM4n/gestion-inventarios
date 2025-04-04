import { Component, OnInit } from '@angular/core';
import { Transaccion } from '../../modelos/transaccion.model';
import { TransaccionService } from '../../servicios/transaccion.service';
import { ProductoService } from '../../servicios/producto.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-lista-transacciones',
    standalone: false,
    templateUrl: './lista-transacciones.component.html',
    styleUrl: './lista-transacciones.component.css'
})
export class ListaTransaccionesComponent implements OnInit {
    transacciones: Transaccion[] = [];
    nombreProductos: { [key: number]: string } = {};

    constructor(
        private transaccionService: TransaccionService,
        private productoService: ProductoService
    ) { }

    ngOnInit() {
        // Carga los datos antes de renderizar la tabla
        forkJoin({
            transacciones: this.transaccionService.obtenerTransacciones(),
            productos: this.productoService.obtenerProductos()
        }).subscribe({
            next: (result) => {
                // Llenar el mapa de nombres de productos
                if (Array.isArray(result.productos)) {
                    result.productos.forEach(producto => {
                        if (producto && producto.hasOwnProperty('id') && producto.hasOwnProperty('nombre')) {
                            this.nombreProductos[producto.id] = producto.nombre;
                        } else {
                            console.warn("Omisión de producto debido a propiedades faltantes:", producto);
                        }
                    });
                } else {
                    console.error("'result.productos' NO es un array.");
                }

                // Asignar transacciones
                this.transacciones = result.transacciones;

                console.log("Datos cargados exitosamente!");
                console.log("Mapa de Productos (después del procesamiento):", this.nombreProductos);

            },
            error: (error) => {
                console.error('Error al cargar los datos:', error);
                alert('No se pudo cargar los datos de la lista');
            }
        });
    }

    eliminarTransaccion(id: number) {
        // Confirmar borrado
        const confirmacion = confirm('¿Seguro de que desea eliminar esta transacción?');

        if (confirmacion) {
            this.transaccionService.eliminarTransaccion(id).subscribe({
                next: () => {
                    // Retirar la transacción de la lista
                    this.transacciones = this.transacciones.filter(t => t.id !== id);
                    alert('Transacción eliminada exitosamente');
                },
                error: (error) => {
                    console.error('Error al eliminar transacción:', error);
                    alert('No se pudo eliminar la transacción');
                }
            });
        }
    }

    obtenerNombreProducto(productoId: number): string {
        return this.nombreProductos[productoId] || 'Producto desconocido';
    }
}
