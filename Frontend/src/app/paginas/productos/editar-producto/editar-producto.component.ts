import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ProductoService } from '../../../servicios/producto.service';
import { Categoria } from '../../../modelos/categoria.model';

@Component({
  selector: 'app-editar-producto',
  standalone: false,
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit {
    formularioProducto!: FormGroup;
    categorias: Categoria[] = [];
    productoId!: number;

    constructor(
        private generarFormulario: FormBuilder,
        private productoService: ProductoService, // Inyecta el Servicio
        private ruta: ActivatedRoute,
        private router: Router // Inyecta el Router
    ) { }

    ngOnInit(): void {
        console.log("Iniciando ngOnInit...");

        // Inicializar formularioProducto como un FormGroup vacío
        this.formularioProducto = this.generarFormulario.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            categoriaId: ['', Validators.required],
            imagen: [''],
            precio: ['', [Validators.required, Validators.min(0)]],
            stock: ['', [Validators.required, Validators.min(1)]]
        });

        // Obtener producto ID de la ruta
        this.productoId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Producto ID obtenido de la ruta:', this.productoId);

        if (!this.productoId) {
            console.error('Producto ID invalido');
            return;
        }

        // Obtener los detalles del producto primero
        console.log("Obteniendo detalles del producto...");
        this.productoService.obtenerProductoPorId(this.productoId).subscribe({
            next: (producto) => {
                console.log("Datos completos del producto:", JSON.stringify(producto, null, 2));

                if (!producto) {
                    console.error('No se encontraron datos del producto.');
                    return;
                }

                // Obtener las categorías después de obtener el producto
                console.log("Obteniendo categorías...");
                this.productoService.obtenerCategorias().subscribe({
                    next: (categorias) => {
                        this.categorias = categorias;
                        console.log("Categorías recibidas:", this.categorias);

                        // If categoria_id is a number (ID reference)
                        const categoriaSeleccionada = this.categorias.find(cat =>
                            cat.id === producto.categoriaId
                        );

                        // If you need to display the selected ID for debugging
                        const categoriaIdSeleccionada = categoriaSeleccionada ? categoriaSeleccionada.id : '';
                        console.log("ID de la categoría seleccionada:", categoriaIdSeleccionada);

                        // Ahora que las categorías están disponibles, establecer el valor en el formulario
                        this.formularioProducto.patchValue({
                            nombre: producto.nombre,
                            descripcion: producto.descripcion,
                            categoriaId: producto.categoriaId, // Asignar el categoriaId aquí
                            imagen: producto.imagen,
                            precio: producto.precio,
                            stock: producto.stock
                        });

                        console.log("Formulario actualizado con datos del producto.");

                    },
                    error: (error) => console.error('Error al obtener categorías:', error)
                });
            },
            error: (error) => console.error('Error al obtener el producto:', error)
        });
    }

    onSubmit(): void {
        if (this.formularioProducto.valid) {
            console.log('Form data being submitted:', this.formularioProducto.value);

            this.productoService.actualizarProducto(this.productoId, this.formularioProducto.value)
                .subscribe({
                    next: (response) => {
                        console.log('Producto actualizado:', response);
                        alert('Producto actualizado exitosamente!');
                        this.router.navigate(['/productos']);
                    },
                    error: (error) => {
                        console.error('Error al actualizar el producto - Detalles:', error);
                        // Log more details about the error
                        if (error.error) {
                            console.error('Error message:', error.error);
                        }
                        if (error.status) {
                            console.error('Status code:', error.status);
                        }
                        alert('Error al actualizar el producto.');
                    }
                });
        } else {
            console.log('Form is invalid:',
                Object.keys(this.formularioProducto.controls).map(key => {
                    return {
                        control: key,
                        valid: this.formularioProducto.get(key)?.valid,
                        value: this.formularioProducto.get(key)?.value
                    };
                })
            );
        }
    }
}
