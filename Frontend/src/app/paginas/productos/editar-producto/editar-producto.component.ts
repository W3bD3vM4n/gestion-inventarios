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
            categoriaId: [null, Validators.required],
            imagen: [''],
            precio: ['', [Validators.required, Validators.min(0)]],
            stock: ['', [Validators.required, Validators.min(1)]]
        });

        // Obtener producto ID de la ruta
        this.productoId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Producto ID obtenido de la ruta:', this.productoId);

        if (!this.productoId) {
            console.error('Producto ID invalido');
            // Maybe redirect or show an error message
            this.router.navigate(['/productos']); // Example redirect
            return;
        }

        // Obtener los detalles del producto primero
        console.log("Obteniendo detalles del producto...");
        this.productoService.obtenerProductoPorId(this.productoId).subscribe({
            next: (producto) => {
                // Type assertion if needed, or use a proper Producto model
                const productData = producto as any; // Use 'as any' or define a proper interface/model for producto

                console.log("Datos completos del producto:", JSON.stringify(producto, null, 2));

                if (!productData) {
                    console.error('No se encontraron datos del producto.');
                    this.router.navigate(['/productos']); // Example redirect
                    return;
                }

                // Obtener las categorías después de obtener el producto
                console.log("Obteniendo categorías...");
                this.productoService.obtenerCategorias().subscribe({
                    next: (categorias) => {
                        this.categorias = categorias;
                        console.log("Categorías recibidas:", this.categorias);

                        // --- FIX: Find the Category ID based on the Name ---
                        let categoriaIdParaFormulario: number | null = null;
                        if (productData.categoria && this.categorias.length > 0) {
                            // Find the category object in the list that matches the product's category name
                            const categoriaEncontrada = this.categorias.find(cat =>
                                // Use case-insensitive comparison for robustness
                                cat.nombre.toLowerCase() === productData.categoria.toLowerCase()
                            );

                            if (categoriaEncontrada) {
                                categoriaIdParaFormulario = categoriaEncontrada.id;
                                console.log(`ID de la categoría encontrada (${productData.categoria}):`, categoriaIdParaFormulario);
                            } else {
                                console.warn(`La categoría "${productData.categoria}" del producto no se encontró en la lista de categorías disponibles.`);
                                // Handle this case - maybe show a warning or don't set the value
                            }
                        } else {
                            console.warn('El producto no tiene categoría definida o la lista de categorías está vacía.');
                        }
                        // --- END FIX ---


                        // Patch the form AFTER finding the correct category ID
                        this.formularioProducto.patchValue({
                            nombre: productData.nombre,
                            descripcion: productData.descripcion,
                            categoriaId: categoriaIdParaFormulario, // Use the found ID here
                            imagen: productData.imagen,
                            precio: productData.precio,
                            stock: productData.stock
                        });

                        console.log("Formulario actualizado con datos del producto. Valor CategoriaID:", this.formularioProducto.get('categoriaId')?.value);

                    },
                    error: (error) => console.error('Error al obtener categorías:', error)
                });
            },
            error: (error) => {
                console.error('Error al obtener el producto:', error);
                // Handle error, maybe redirect
                this.router.navigate(['/productos']);
            }
        });
    }

    onSubmit(): void {
        if (this.formularioProducto.valid) {
            if (this.formularioProducto.valid) {
                // --- Make sure the ID is included in the data sent ---
                const datosParaActualizar = {
                    id: this.productoId, // Add the ID from the route
                    ...this.formularioProducto.value, // Spread the form values
                };
                // ----------------------------------------------------

                console.log('Form data being submitted:', this.formularioProducto.value); // Original form values
                console.log('Data prepared for update:', datosParaActualizar); // Data including ID

                this.productoService.actualizarProducto(this.productoId, datosParaActualizar)
                    .subscribe({
                        next: (response) => {
                            console.log('Producto actualizado:', response);
                            alert('Producto actualizado exitosamente!');
                            this.router.navigate(['/productos']);
                        },
                        error: (error) => {
                            console.error('Error al actualizar el producto - Detalles:', error);
                            if (error.error) { console.error('Error message:', error.error); }
                            if (error.status) { console.error('Status code:', error.status); }
                            alert(`Error al actualizar el producto: ${error.message || 'Error desconocido'}`);
                        }
                    });
            } else {
                console.log('Form is invalid:',
                    Object.keys(this.formularioProducto.controls).map(key => {
                        const control = this.formularioProducto.get(key);
                        return {
                            control: key,
                            valid: control?.valid,
                            touched: control?.touched,
                            errors: control?.errors,
                            value: control?.value
                        };
                    })
                );
                // Mark all fields as touched to show validation errors
                this.formularioProducto.markAllAsTouched();
            }
        }
    }
}