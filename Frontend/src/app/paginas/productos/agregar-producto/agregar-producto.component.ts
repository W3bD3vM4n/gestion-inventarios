import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../../servicios/producto.service';
import { Categoria } from '../../../modelos/categoria.model';

@Component({
    selector: 'app-agregar-producto',
    standalone: false,
    templateUrl: './agregar-producto.component.html',
    styleUrl: './agregar-producto.component.css'
})
export class AgregarProductoComponent implements OnInit {
    formularioProducto!: FormGroup;
    categorias: Categoria[] = [];

    constructor(
        private generarFormulario: FormBuilder,
        private productoService: ProductoService, // Inyecta el Servicio
        private router: Router // Inyecta el Router
    ) { }

    ngOnInit(): void {
        this.formularioProducto = this.generarFormulario.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            categoria_id: ['', Validators.required],
            imagen: [''],
            precio: ['', [Validators.required, Validators.min(0)]],
            stock: ['', [Validators.required, Validators.min(1)]]
        });

        // Obtener categorias de la API
        this.productoService.obtenerCategorias().subscribe({
            next: (categorias) => this.categorias = categorias,
            error: (error) => console.error('Error al obtener categorías:', error)
        });
    }

    onSubmit(): void {
        if (this.formularioProducto.valid) {
            this.productoService.guardarProducto(this.formularioProducto.value)
                .subscribe({
                    next: (response) => {
                        console.log('Producto guardado:', response);
                        alert('Producto agregado exitosamente!');
                        this.router.navigate(['/productos']); // Redirecciona a Lista de Productos
                    },
                    error: (error) => {
                        console.error('Error al guardar el producto:', error);
                        alert('Error al agregar el producto.');
                    }
            });
        }
    }
}
