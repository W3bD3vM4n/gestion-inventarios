import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Producto } from '../../../modelos/producto.model';
import { TipoTransaccion } from '../../../modelos/tipo-transaccion.model';
import { TransaccionService } from '../../../servicios/transaccion.service';
import { ProductoService } from '../../../servicios/producto.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-editar-transaccion',
    standalone: false,
    templateUrl: './editar-transaccion.component.html',
    styleUrl: './editar-transaccion.component.css'
})
export class EditarTransaccionComponent implements OnInit {
    formularioTransaccion!: FormGroup;
    productos: Producto[] = [];
    tiposTransaccion: TipoTransaccion[] = [];
    transaccionId!: number;
    readonly TIPO_VENTA_ID = 2; // Asigna el ID correspondiente a las ventas
    productoOriginal: any = null; // Para almacenar el producto y cantidad originales
    transaccionOriginal: any = null; // Para almacenar la transacción original

    constructor(
        private generarFormulario: FormBuilder,
        private transaccionService: TransaccionService,
        private productoService: ProductoService,
        private ruta: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log("Iniciando ngOnInit de editar-transaccion...");

        // Inicializar formularioTransaccion
        this.iniciarFormulario();

        // Obtener transaccion ID de la ruta
        this.transaccionId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Transaccion ID obtenido de la ruta:', this.transaccionId);

        if (!this.transaccionId) {
            console.error('Transaccion ID invalido');
            return;
        }

        // Cargar productos y tipos de transacción
        this.cargarProductos();
        this.cargarTiposTransaccion();

        // Obtener los detalles de la transacción
        console.log("Obteniendo detalles de la transacción...");
        this.transaccionService.obtenerTransaccion(this.transaccionId).subscribe({
            next: (transaccion) => {
                console.log("Datos completos de la transacción:", JSON.stringify(transaccion, null, 2));

                if (!transaccion) {
                    console.error('No se encontraron datos de la transacción.');
                    return;
                }

                // Almacenar la transacción original
                this.transaccionOriginal = { ...transaccion };

                // Ahora actualizamos el formulario con los datos obtenidos
                this.formularioTransaccion.patchValue({
                    tipoTransaccionId: transaccion.tipoTransaccion,
                    productoId: transaccion.productoId,
                    cantidad: transaccion.cantidad,
                    precioUnitario: transaccion.precioUnitario,
                    detalle: transaccion.detalle
                });

                // Almacenar producto y cantidad original para cálculos de stock
                this.productoOriginal = {
                    id: transaccion.productoId,
                    cantidad: transaccion.cantidad
                };

                console.log("Formulario actualizado con datos de la transacción.");
            },
            error: (error) => console.error('Error al obtener la transacción:', error)
        });
    }

    iniciarFormulario(): void {
        this.formularioTransaccion = this.generarFormulario.group({
            tipoTransaccionId: ['', Validators.required],
            productoId: ['', Validators.required],
            cantidad: ['', [Validators.required, Validators.min(1)]],
            precioUnitario: ['', [Validators.required, Validators.min(0.01)]],
            detalle: ['']
        });

        // Agregar listeners para cambios
        this.formularioTransaccion.get('tipoTransaccionId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe(() => {
            this.verificarStock();
            this.actualizarPrecioUnitario();
        });
        this.formularioTransaccion.get('cantidad')?.valueChanges.subscribe(() => this.verificarStock());
    }

    cargarProductos(): void {
        this.productoService.obtenerProductos().subscribe({
            next: (productos) => {
                this.productos = productos;
                console.log("Productos cargados:", this.productos.length);
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
                console.log("Tipos de transacción cargados:", this.tiposTransaccion.length);
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

            if (productoSeleccionado) {
                let stockAjustado = productoSeleccionado.stock;

                // Si estamos editando una venta, ajustamos el stock para considerar la cantidad original
                if (this.productoOriginal && this.productoOriginal.id === productoId && 
                    this.transaccionOriginal && this.transaccionOriginal.tipoTransaccionId === this.TIPO_VENTA_ID) {
                    stockAjustado += this.productoOriginal.cantidad;
                }

                if (stockAjustado < cantidad) {
                    this.formularioTransaccion.get('cantidad')?.setErrors({ stockInsuficiente: true });
                }
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
        if (this.formularioTransaccion.invalid) {
            console.log('Formulario inválido:',
                Object.keys(this.formularioTransaccion.controls).map(key => {
                    return {
                        control: key,
                        valid: this.formularioTransaccion.get(key)?.valid,
                        value: this.formularioTransaccion.get(key)?.value,
                        errors: this.formularioTransaccion.get(key)?.errors
                    };
                })
            );
            return;
        }

        const transaccion = {
            ...this.formularioTransaccion.value,
            precioTotal: this.calcularPrecioTotal()
        };

        console.log('Datos de transacción a actualizar:', transaccion);

        this.transaccionService.actualizarTransaccion(this.transaccionId, transaccion).subscribe({
            next: (response) => {
                console.log('Transacción actualizada:', response);
                alert('Transacción actualizada exitosamente!');
                this.router.navigate(['/transacciones']);
            },
            error: (error) => {
                console.error('Error al actualizar la transacción - Detalles:', error);
                if (error.error) {
                    console.error('Error message:', error.error);
                }
                if (error.status) {
                    console.error('Status code:', error.status);
                }
                alert('Error al actualizar la transacción.');
            }
        });
    }
}
