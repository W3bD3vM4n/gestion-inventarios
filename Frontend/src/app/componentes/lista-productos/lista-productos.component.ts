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
        this.productoService.obtenerProductos().subscribe((data) => {
            this.productos = data;
        });
    }
}
