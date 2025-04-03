import { Component, OnInit } from '@angular/core';
import { Transaccion } from '../../modelos/transaccion.model';
import { TransaccionService } from '../../servicios/transaccion.service';
import { ProductoService } from '../../servicios/producto.service';

@Component({
    selector: 'app-lista-transacciones',
    standalone: false,
    templateUrl: './lista-transacciones.component.html',
    styleUrl: './lista-transacciones.component.css'
})
export class ListaTransaccionesComponent implements OnInit {
    transacciones: Transaccion[] = [];
    nombreProductos: { [key: number]: string } = {};
    nombreTipos: { [key: number]: string } = {};

    constructor(
        private transaccionService: TransaccionService,
        private productoService: ProductoService
    ) { }

    ngOnInit() {
        this.cargarTransacciones();
        this.cargarProductos();
        this.cargarTiposTransaccion();
    }

    cargarTransacciones() {
        this.transaccionService.obtenerTransacciones().subscribe({
            next: (data) => {
                this.transacciones = data;
            },
            error: (error) => {
                console.error('Error al cargar transacciones:', error);
                alert('No se pudieron cargar las transacciones');
            }
        });
    }

    cargarProductos() {
        this.productoService.obtenerProductos().subscribe({
            next: (productos) => {
                productos.forEach(producto => {
                    this.nombreProductos[producto.id] = producto.nombre;
                });
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
            }
        });
    }

    cargarTiposTransaccion() {
        this.transaccionService.obtenerTiposTransaccion().subscribe({
            next: (tipos) => {
                tipos.forEach(tipo => {
                    this.nombreTipos[tipo.id] = tipo.tipo;
                });
            },
            error: (error) => {
                console.error('Error al cargar tipos de transacción:', error);
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

    obtenerNombreTipoTransaccion(tipoId: number): string {
        return this.nombreTipos[tipoId] || 'Tipo desconocido';
    }
}
