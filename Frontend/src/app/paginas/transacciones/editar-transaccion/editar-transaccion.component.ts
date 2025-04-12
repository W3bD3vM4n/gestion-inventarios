import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Transaccion } from '../../../modelos/transaccion.model';
import { Producto } from '../../../modelos/producto.model';
import { TipoTransaccion } from '../../../modelos/tipo-transaccion.model';
import { TransaccionService } from '../../../servicios/transaccion.service';
import { ProductoService } from '../../../servicios/producto.service';
import { forkJoin, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    transaccionOriginal: Transaccion | null = null; // Para almacenar la transacción original

    constructor(
        private generarFormulario: FormBuilder,
        private transaccionService: TransaccionService,
        private productoService: ProductoService,
        private ruta: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log("Iniciando ngOnInit de editar-transaccion...");

        // Initialize the form structure FIRST
        this.iniciarFormulario();

        // Get transaccion ID from the route
        this.transaccionId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Transaccion ID obtenido de la ruta:', this.transaccionId);

        if (!this.transaccionId) {
            console.error('Transaccion ID invalido');
            this.router.navigate(['/transacciones']); // Redirect if ID is invalid
            return;
        }

        // Fetch the transaction data first
        console.log("Obteniendo detalles de la transacción...");
        this.transaccionService.obtenerTransaccionPorId(this.transaccionId).subscribe({
            next: (transaccion) => {
                console.log("Datos base de la transacción recibidos:", JSON.stringify(transaccion, null, 2));

                if (!transaccion) {
                    console.error('No se encontraron datos de la transacción.');
                    this.router.navigate(['/transacciones']); // Redirect if not found
                    return;
                }

                // Store the original transaction
                this.transaccionOriginal = { ...transaccion };

                // Now, fetch the data needed for dropdowns (Products and Transaction Types) concurrently
                console.log("Cargando datos para dropdowns (productos y tipos)...");
                forkJoin({
                    productos: this.cargarProductos(), // Make these return the Observable
                    tipos: this.cargarTiposTransaccion() // Make these return the Observable
                }).subscribe({
                    next: ({ productos, tipos }) => {
                        // Data for dropdowns is now loaded
                        this.productos = productos;
                        this.tiposTransaccion = tipos;
                        console.log("Productos y Tipos cargados.");

                        // --- PATCH THE FORM HERE ---
                        // Ensure the property name matches the updated interface (tipoTransaccionId)
                        console.log("Actualizando (patching) el formulario...");
                        this.formularioTransaccion.patchValue({
                            tipoTransaccionId: this.transaccionOriginal?.tipoTransaccionId, // Use ID from original data
                            productoId: this.transaccionOriginal?.productoId,
                            cantidad: this.transaccionOriginal?.cantidad,
                            precioUnitario: this.transaccionOriginal?.precioUnitario,
                            detalle: this.transaccionOriginal?.detalle
                        });
                        console.log("Formulario actualizado con datos.");

                        // Store original product details needed for stock logic
                        this.productoOriginal = {
                            id: this.transaccionOriginal?.productoId,
                            cantidad: this.transaccionOriginal?.cantidad
                        };

                        // Optional: Trigger validation/calculation after patching if needed
                        this.verificarStock();

                    },
                    error: (error) => console.error('Error al cargar datos para dropdowns:', error)
                });
            },
            error: (error) => {
                console.error('Error fatal al obtener la transacción:', error);
                alert('Error al cargar la transacción. Volviendo a la lista.');
                this.router.navigate(['/transacciones']);
            }
        });
    }

    iniciarFormulario(): void {
        this.formularioTransaccion = this.generarFormulario.group({
            tipoTransaccionId: ['', Validators.required], // Expects ID
            productoId: ['', Validators.required],
            cantidad: ['', [Validators.required, Validators.min(1)]],
            precioUnitario: ['', [Validators.required, Validators.min(0.01)]], // Consider if this should be disabled initially
            detalle: ['']
        });

        // Setup listeners AFTER the form is created
        this.setupFormListeners();
    }

    // Modify loading methods to return Observables for forkJoin
    cargarProductos(): Observable<Producto[]> {
        return this.productoService.obtenerProductos().pipe(
            tap({ // Use tap for side-effects like logging or alerting on error
                error: (error) => {
                    console.error('Error al cargar productos:', error);
                    alert('No se pudieron cargar los productos');
                }
            })
        );
    }

    cargarTiposTransaccion(): Observable<TipoTransaccion[]> {
        return this.transaccionService.obtenerTiposTransaccion().pipe(
            tap({ // Use tap for side-effects
                error: (error) => {
                    console.error('Error al cargar tipos de transacción:', error);
                    alert('No se pudieron cargar los tipos de transacción');
                }
            })
        );
    }

    // Keep listeners separate for clarity
    setupFormListeners(): void {
        this.formularioTransaccion.get('tipoTransaccionId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe((productId) => {
            this.actualizarPrecioUnitario(productId); // Pass the ID
            this.verificarStock();
        });
        this.formularioTransaccion.get('cantidad')?.valueChanges.subscribe(() => this.verificarStock());
        // Consider adding listener for precioUnitario if it can be manually changed
        // this.formularioTransaccion.get('precioUnitario')?.valueChanges.subscribe(() => /* Recalculate something? */);
    }

    // Modify actualizarPrecioUnitario to accept productId
    actualizarPrecioUnitario(productoId: number): void {
        if (!productoId) {
            this.formularioTransaccion.get('precioUnitario')?.setValue(''); // Clear if no product selected
            return;
        }
        const productoSeleccionado = this.productos.find(p => p.id === productoId);
        if (productoSeleccionado) {
            this.formularioTransaccion.get('precioUnitario')?.setValue(productoSeleccionado.precio);
            console.log(`Precio unitario actualizado a ${productoSeleccionado.precio} para producto ID ${productoId}`);
        } else {
            this.formularioTransaccion.get('precioUnitario')?.setValue(''); // Clear if product not found (shouldn't happen)
        }
    }

    verificarStock(): void {
        const cantidadControl = this.formularioTransaccion.get('cantidad');
        if (!cantidadControl) return; // Safety check

        // Clear previous stock error first
        if (cantidadControl.hasError('stockInsuficiente')) {
            const errors = cantidadControl.errors || {};
            delete errors['stockInsuficiente'];
            cantidadControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        const productoId = this.formularioTransaccion.get('productoId')?.value;
        const cantidad = cantidadControl.value;
        const tipoId = this.formularioTransaccion.get('tipoTransaccionId')?.value;

        if (!productoId || !cantidad || !tipoId || cantidad <= 0) return; // Don't check if data is missing or invalid

        // Only verify stock for "Sale" type transactions
        if (tipoId === this.TIPO_VENTA_ID) {
            const productoSeleccionado = this.productos.find(p => p.id === productoId);

            if (productoSeleccionado) {
                let stockDisponibleReal = productoSeleccionado.stock;

                // *** Crucial Stock Adjustment Logic for Editing ***
                // If we are editing the *original* product of this transaction AND the *original* transaction was a SALE,
                // we need to temporarily add back the original quantity to the available stock for the check.
                if (this.transaccionOriginal && this.productoOriginal &&
                    this.transaccionOriginal.tipoTransaccionId === this.TIPO_VENTA_ID && // Original was a sale
                    this.productoOriginal.id === productoId) { // It's the same product we started editing

                    stockDisponibleReal += this.productoOriginal.cantidad; // Add back original amount
                    console.log(`Ajustando stock para verificación: ${productoSeleccionado.stock} (actual) + ${this.productoOriginal.cantidad} (original) = ${stockDisponibleReal}`);
                }
                // *** End of Adjustment Logic ***

                if (stockDisponibleReal < cantidad) {
                    console.warn(`Stock insuficiente: ${stockDisponibleReal} disponible < ${cantidad} solicitado.`);
                    cantidadControl.setErrors({ ...(cantidadControl.errors || {}), stockInsuficiente: true });
                } else {
                    console.log(`Stock suficiente: ${stockDisponibleReal} disponible >= ${cantidad} solicitado.`);
                    // The clearing logic at the start handles removing the error if it's now sufficient
                }
            }
        }
    }

    calcularPrecioTotal(): number {
        const cantidad = this.formularioTransaccion.get('cantidad')?.value || 0;
        const precioUnitario = this.formularioTransaccion.get('precioUnitario')?.value || 0;
        // Add a check to ensure types are numbers before multiplying
        const total = (typeof cantidad === 'number' && typeof precioUnitario === 'number')
            ? cantidad * precioUnitario
            : 0;
        return total;
    }

    onSubmit(): void {
        this.formularioTransaccion.markAllAsTouched(); // Mark all fields for validation feedback

        if (this.formularioTransaccion.invalid) {
            console.log('Formulario inválido. Detalles:', this.formularioTransaccion.errors);
            // Log detailed errors per control
            Object.keys(this.formularioTransaccion.controls).forEach(key => {
                const controlErrors = this.formularioTransaccion.get(key)?.errors;
                if (controlErrors != null) {
                    console.log('Control:', key, 'Errors:', controlErrors);
                }
            });
            alert('El formulario contiene errores. Por favor, revise los campos marcados.');
            return;
        }

        // Prepare data for submission
        // Ensure you are sending the correct ID field name expected by the backend API
        const transaccionParaActualizar: Partial<Transaccion> = { // Use Partial<Transaccion> or a specific DTO
            // id is passed in the URL/service method, usually not needed in the body for PUT
            tipoTransaccionId: this.formularioTransaccion.value.tipoTransaccionId,
            productoId: this.formularioTransaccion.value.productoId,
            cantidad: this.formularioTransaccion.value.cantidad,
            precioUnitario: this.formularioTransaccion.value.precioUnitario,
            precioTotal: this.calcularPrecioTotal(),
            detalle: this.formularioTransaccion.value.detalle,
            // Include fecha if your backend expects it, otherwise it might update it server-side
            // fecha: new Date() // Or keep original date? Depends on requirements.
        };


        console.log('Datos de transacción a actualizar:', JSON.stringify(transaccionParaActualizar, null, 2));

        // Call the service
        this.transaccionService.actualizarTransaccion(this.transaccionId, transaccionParaActualizar as Transaccion).subscribe({
            next: (response) => {
                console.log('Transacción actualizada con éxito:', response);
                alert('Transacción actualizada exitosamente!');
                this.router.navigate(['/transacciones']);
            },
            error: (error) => {
                console.error('Error al actualizar la transacción - Detalles:', error);
                // Provide more specific feedback if possible
                let errorMsg = 'Error desconocido al actualizar la transacción.';
                if (error.error) {
                    // Check if backend sends structured error messages
                    if (typeof error.error === 'string') {
                        errorMsg = error.error;
                    } else if (error.error.message) {
                        errorMsg = error.error.message;
                    } else if (error.statusText) {
                        errorMsg = error.statusText;
                    }
                } else if (error.message) {
                    errorMsg = error.message;
                }
                console.error('Mensaje de error:', errorMsg);
                console.error('Código de estado:', error.status);
                alert(`Error al actualizar la transacción: ${errorMsg}`);
            }
        });
    }
}
