import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-agregar-producto',
    standalone: false,
    templateUrl: './agregar-producto.component.html',
    styleUrl: './agregar-producto.component.css'
})
export class AgregarProductoComponent implements OnInit {
    formularioProducto!: FormGroup;

    constructor(private generarFormulario: FormBuilder) { }

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
            console.log('Producto agregado:', this.formularioProducto.value);
            // TODO: Enviar datos al servicio API
        }
    }
}
