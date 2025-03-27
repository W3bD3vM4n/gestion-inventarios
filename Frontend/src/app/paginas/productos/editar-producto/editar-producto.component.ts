import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../../servicios/producto.service';

@Component({
  selector: 'app-editar-producto',
  standalone: false,
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit {
    formularioProducto!: FormGroup;
    productoId!: number;

    constructor(
        private generarFormulario: FormBuilder,
        private ruta: ActivatedRoute,
        private productoService: ProductoService
    ) { }

    ngOnInit(): void {
        // Inicializar formularioProducto como un FormGroup vacío
        this.formularioProducto = this.generarFormulario.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            precio: [0, [Validators.required, Validators.min(0)]],
            stock: [1, [Validators.required, Validators.min(1)]]
        });

        // Obtener producto ID de la ruta
        this.productoId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Editar producto con ID:', this.productoId);

        if (!this.productoId) {
            console.error('Product ID invalido');
            return;
        }

        // Obtener detalles del producto de la API
        this.productoService.obtenerProductoPorId(this.productoId).subscribe((producto) => {
            if (!producto) {
                console.error('No se encontraron datos del producto.');
                return;
            }

            console.log('Datos del producto:', producto);

            // Después de obtener los datos, parchee los valores en el formulario
            this.formularioProducto.patchValue({
                nombre: producto.nombre,
                descripcion: producto.descripcion,
                precio: producto.precio,
                stock: producto.stock
            });
        });
    }

    onSubmit(): void {
        if (this.formularioProducto.valid) {
            console.log('Producto actualizado:', this.formularioProducto.value);
            // TODO: Llamar a la API para actualizar el producto
        }
    }
}
