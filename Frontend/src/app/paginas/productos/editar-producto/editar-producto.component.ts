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
        // Inicializa formularioProducto como vacío
        this.formularioProducto = this.generarFormulario.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            categoriaId: [null, Validators.required],
            imagen: [''],
            precio: ['', [Validators.required, Validators.min(0)]],
            stock: ['', [Validators.required, Validators.min(1)]]
        });

        // Obtiene el producto ID de la ruta
        this.productoId = Number(this.ruta.snapshot.paramMap.get('id'));

        if (!this.productoId) {
            console.error('Producto ID invalido');
            this.router.navigate(['/productos']); // Ejemplo de redirección
            return;
        }

        // Obtiene primero los detalles del producto
        this.productoService.obtenerProductoPorId(this.productoId).subscribe({
            next: (producto) => {
                const productData = producto as any;

                if (!productData) {
                    this.router.navigate(['/productos']); // Ejemplo de redirección
                    return;
                }

                // Obtiene las categorías después de obtener el producto
                this.productoService.obtenerCategorias().subscribe({
                    next: (categorias) => {
                        this.categorias = categorias;

                        // Parchea el formulario DESPUÉS de encontrar el ID de categoría correcto
                        this.formularioProducto.patchValue({
                            nombre: productData.nombre,
                            descripcion: productData.descripcion,
                            categoriaId: productData.categoriaId,
                            imagen: productData.imagen,
                            precio: productData.precio,
                            stock: productData.stock
                        });

                    },
                    error: (error) => console.error('Error al obtener categorías:', error)
                });
            },
            error: (error) => {
                console.error('Error al obtener el producto:', error);
                this.router.navigate(['/productos']);
            }
        });
    }

    onSubmit(): void {
        if (this.formularioProducto.valid) {
            if (this.formularioProducto.valid) {
                const datosParaActualizar = {
                    id: this.productoId, // Añade el ID de la ruta
                    ...this.formularioProducto.value, // Distribuye los valores del formulario
                };

                this.productoService.actualizarProducto(this.productoId, datosParaActualizar)
                    .subscribe({
                        next: (response) => {
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
                // Marca los campos tocados para mostrar errores de validación
                this.formularioProducto.markAllAsTouched();
            }
        }
    }
}