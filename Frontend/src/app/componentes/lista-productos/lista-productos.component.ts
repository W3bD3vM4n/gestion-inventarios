import { Component, OnInit } from '@angular/core';
import { Producto } from '../../modelos/producto.model';
import { ProductoService } from '../../servicios/producto.service';

@Component({
    selector: 'app-lista-productos',
    standalone: false,
    templateUrl: './lista-productos.component.html',
    styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit {
    productos: Producto[] = [];

    constructor(private productoService: ProductoService) { }

    ngOnInit() {
        this.cargarProductos();
    }

    cargarProductos() {
        this.productoService.obtenerProductos().subscribe({
            next: (data) => {
                this.productos = data;
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
                alert('No se pudieron cargar los productos');
            }
        });
    }

    eliminarProducto(id: number) {
        // Confirmar borrado
        const confirmacion = confirm('¿Seguro de que desea eliminarlo?');

        if (confirmacion) {
            this.productoService.eliminarProducto(id).subscribe({
                next: () => {
                    // Retirar el producto de la lista
                    this.productos = this.productos.filter(p => p.id !== id);
                    alert('Producto eliminado exitosamente');
                },
                error: (error) => {
                    console.error('Error al eliminar producto:', error);
                    alert('No se pudo eliminar el producto');
                }
            });
        }
    }
}
