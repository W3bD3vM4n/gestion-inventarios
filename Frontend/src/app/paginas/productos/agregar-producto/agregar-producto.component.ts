import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../../servicios/producto.service';

@Component({
    selector: 'app-agregar-producto',
    standalone: false,
    templateUrl: './agregar-producto.component.html',
    styleUrl: './agregar-producto.component.css'
})
export class AgregarProductoComponent implements OnInit {
    formularioProducto!: FormGroup;

    constructor(
        private generarFormulario: FormBuilder,
        private productoService: ProductoService, // Inyecta el servicio
        private router: Router // Inyecta el Router para navegar
    ) { }

    ngOnInit(): void {
        this.formularioProducto = this.generarFormulario.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            precio: ['', [Validators.required, Validators.min(0)]],
            stock: ['', [Validators.required, Validators.min(1)]]
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
