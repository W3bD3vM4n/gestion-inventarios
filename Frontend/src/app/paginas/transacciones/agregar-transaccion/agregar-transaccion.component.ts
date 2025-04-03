import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../../modelos/producto.model';
import { ProductoService } from '../../../servicios/producto.service';
import { TipoTransaccion } from '../../../modelos/tipo-transaccion.model';
import { TransaccionService } from '../../../servicios/transaccion.service';

@Component({
    selector: 'app-agregar-transaccion',
    standalone: false,
    templateUrl: './agregar-transaccion.component.html',
    styleUrl: './agregar-transaccion.component.css'
})
export class AgregarTransaccionComponent implements OnInit {
    formularioTransaccion!: FormGroup;
    productos: Producto[] = [];
    tiposTransaccion: TipoTransaccion[] = [];
    readonly TIPO_VENTA_ID = 2; // Asigna el ID correspondiente a las ventas

    constructor(
        private generarFormulario: FormBuilder,
        private productoService: ProductoService,
        private transaccionService: TransaccionService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.iniciarFormulario();
        this.cargarProductos();
        this.cargarTiposTransaccion();

        // Agrega listeners para cambios en producto, cantidad y tipo de transacción
        this.formularioTransaccion.get('tipoTransaccionId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe(() => this.actualizarPrecioUnitario());
        this.formularioTransaccion.get('cantidad')?.valueChanges.subscribe(() => this.verificarStock());
    }

    iniciarFormulario(): void {
        this.formularioTransaccion = this.generarFormulario.group({
            tipoTransaccionId: ['', Validators.required],
            productoId: ['', Validators.required],
            cantidad: ['', [Validators.required, Validators.min(1)]],
            precioUnitario: ['', [Validators.required, Validators.min(0.01)]],
            detalle: ['']
        });
    }

    cargarProductos(): void {
        this.productoService.obtenerProductos().subscribe({
            next: (productos) => {
                this.productos = productos;
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
                alert('No se pudieron cargar los productos');
            }
        });
    }

    cargarTiposTransaccion(): void {
        this.transaccionService.obtenerTiposTransaccion().subscribe({
            next: (tipos) => {
                this.tiposTransaccion = tipos;
            },
            error: (error) => {
                console.error('Error al cargar tipos de transacción:', error);
                alert('No se pudieron cargar los tipos de transacción');
            }
        });
    }

    verificarStock(): void {
        const productoId = this.formularioTransaccion.get('productoId')?.value;
        const cantidad = this.formularioTransaccion.get('cantidad')?.value;
        const tipoId = this.formularioTransaccion.get('tipoTransaccionId')?.value;

        if (!productoId || !cantidad || !tipoId) return;

        // Solo verificar stock para transacciones de venta
        if (tipoId === this.TIPO_VENTA_ID) {
            const productoSeleccionado = this.productos.find(p => p.id === productoId);

            if (productoSeleccionado && productoSeleccionado.stock < cantidad) {
                this.formularioTransaccion.get('cantidad')?.setErrors({ stockInsuficiente: true });
            }
        }
    }

    actualizarPrecioUnitario(): void {
        const productoId = this.formularioTransaccion.get('productoId')?.value;
        if (!productoId) return;

        const productoSeleccionado = this.productos.find(p => p.id === productoId);
        if (productoSeleccionado) {
            this.formularioTransaccion.get('precioUnitario')?.setValue(productoSeleccionado.precio);
        }
    }

    calcularPrecioTotal(): number {
        const cantidad = this.formularioTransaccion.get('cantidad')?.value || 0;
        const precioUnitario = this.formularioTransaccion.get('precioUnitario')?.value || 0;
        return cantidad * precioUnitario;
    }

    onSubmit(): void {
        if (this.formularioTransaccion.invalid) return;

        const transaccion = {
            ...this.formularioTransaccion.value,
            fecha: new Date(),
            precioTotal: this.calcularPrecioTotal()
        };

        this.transaccionService.guardarTransaccion(transaccion).subscribe({
            next: (response) => {
                console.log('Transacción guardada:', response);
                alert('Transacción agregada exitosamente!');
                this.router.navigate(['/transacciones']); // Redirecciona a Lista de Transacciones
            },
            error: (error) => {
                console.error('Error al guardar la transacción:', error);
                alert('Error al agregar la transacción.');
            }
        });
    }
}
