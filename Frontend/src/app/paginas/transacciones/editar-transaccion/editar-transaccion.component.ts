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
    precioTotalCalculado: number = 0;

    constructor(
        private generarFormulario: FormBuilder,
        private transaccionService: TransaccionService,
        private productoService: ProductoService,
        private ruta: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        console.log("Iniciando ngOnInit de editar-transaccion...");

        // Inicializa la estructura del formulario PRIMERO
        this.iniciarFormulario();

        // Obtiene el ID de transacción de la ruta
        this.transaccionId = Number(this.ruta.snapshot.paramMap.get('id'));
        console.log('Transaccion ID obtenido de la ruta:', this.transaccionId);

        if (!this.transaccionId) {
            console.error('Transaccion ID invalido');
            this.router.navigate(['/transacciones']); // Redirige si el ID no es valido
            return;
        }

        // Obtiene primero los datos de la transacción
        console.log("Obteniendo detalles de la transacción...");
        this.transaccionService.obtenerTransaccionPorId(this.transaccionId).subscribe({
            next: (transaccion) => {
                console.log("Datos base de la transacción recibidos:", JSON.stringify(transaccion, null, 2));

                if (!transaccion) {
                    console.error('No se encontraron datos de la transacción.');
                    this.router.navigate(['/transacciones']); // Redirige si no se encuentra
                    return;
                }

                // Almacena la transacción original
                this.transaccionOriginal = { ...transaccion };

                // Obtiene los datos necesarios para los DropDownsList (productos y tipos de transacción) simultáneamente
                console.log("Cargando datos para dropdowns (productos y tipos)...");
                forkJoin({
                    productos: this.cargarProductos(), // Hace que devuelvan el Observable
                    tipos: this.cargarTiposTransaccion() // Hace que devuelvan el Observable
                }).subscribe({
                    next: ({ productos, tipos }) => {
                        // Los datos de los DropDownsList ya están cargados
                        this.productos = productos;
                        this.tiposTransaccion = tipos;
                        console.log("Productos y Tipos cargados.");

                        // --- PATCH THE FORM HERE ---
                        // Se asegra que el nombre de la propiedad coincida con la interfaz actualizada (tipoTransaccionId)
                        console.log("Actualizando (patching) el formulario...");
                        this.formularioTransaccion.patchValue({
                            tipoTransaccionId: this.transaccionOriginal?.tipoTransaccionId, // Usar ID de los datos originales
                            productoId: this.transaccionOriginal?.productoId,
                            cantidad: this.transaccionOriginal?.cantidad,
                            precioUnitario: this.transaccionOriginal?.precioUnitario,
                            detalle: this.transaccionOriginal?.detalle
                        });
                        console.log("Formulario actualizado con datos.");

                        // Almacena los detalles originales del producto necesarios para la lógica de stock
                        this.productoOriginal = {
                            id: this.transaccionOriginal?.productoId,
                            cantidad: this.transaccionOriginal?.cantidad
                        };

                        // Opcional: Activar la validación/cálculo después de aplicar el parche si es necesario
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
            tipoTransaccionId: ['', Validators.required], // Espera ID
            productoId: ['', Validators.required],
            cantidad: ['', [Validators.required, Validators.min(1)]],
            precioUnitario: ['', [Validators.required, Validators.min(0.01)]], // Considere si esto debería desactivarse inicialmente
            detalle: ['']
        });

        // Configura los listeners DESPUÉS de crear el formulario
        this.setupFormListeners();
    }

    // Modifica los métodos de carga para devolver Observables para forkJoin
    cargarProductos(): Observable<Producto[]> {
        return this.productoService.obtenerProductos().pipe(
            tap({ // Utiliza pipe para detectar efectos secundarios
                error: (error) => {
                    console.error('Error al cargar productos:', error);
                    alert('No se pudieron cargar los productos');
                }
            })
        );
    }

    cargarTiposTransaccion(): Observable<TipoTransaccion[]> {
        return this.transaccionService.obtenerTiposTransaccion().pipe(
            tap({ // Utiliza pipe para detectar efectos secundarios
                error: (error) => {
                    console.error('Error al cargar tipos de transacción:', error);
                    alert('No se pudieron cargar los tipos de transacción');
                }
            })
        );
    }

    // Mantiene los listeners separados para mayor claridad
    setupFormListeners(): void {
        // Listeners existentes
        this.formularioTransaccion.get('tipoTransaccionId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe((productId) => {
            this.actualizarPrecioUnitario(productId); // Pasa el ID
            this.verificarStock();
        });
        this.formularioTransaccion.get('cantidad')?.valueChanges.subscribe(() => this.verificarStock());

        // Actualiza los cálculos cuando cambia la cantidad
        this.actualizarPrecioTotalVisual();

        // Considere agregar un listener para precioUnitario si puede ser manual
        // this.formularioTransaccion.get('precioUnitario')?.valueChanges.subscribe(() => /* Recalculate something? */);

        // Agrega este listener para cambios de precios
        this.formularioTransaccion.get('precioUnitario')?.valueChanges.subscribe(() => {
            this.actualizarPrecioTotalVisual();
        });
    }

    // Nuevo método para actualizar un indicador visual del precio total
    actualizarPrecioTotalVisual(): void {
        const total = this.calcularPrecioTotal();
        // Si desea mostrar esto en algún lugar del UI
        this.precioTotalCalculado = total; // Agrega esta propiedad al componente
        console.log(`Precio total calculado: ${total}`);
    }

    // Modifica actualizarPrecioUnitario para aceptar productId
    actualizarPrecioUnitario(productoId: number | string): void {
        if (!productoId) {
            this.formularioTransaccion.get('precioUnitario')?.setValue(''); // Borra si no se ha seleccionado ningún producto
            return;
        }

        // Añade conversión de tipos por seguridad
        const idToCompare = typeof productoId === 'string' ? Number(productoId) : productoId;

        const productoSeleccionado = this.productos.find(p => p.id === idToCompare);

        if (productoSeleccionado) {
            this.formularioTransaccion.get('precioUnitario')?.setValue(productoSeleccionado.precio);
            console.log(`Precio unitario actualizado a ${productoSeleccionado.precio} para producto ID ${productoId}`);
        } else {
            this.formularioTransaccion.get('precioUnitario')?.setValue(''); // Limpia si no se encuentra el producto (no debería suceder)
            console.log('Producto no encontrado en el array de productos');
        }
    }

    verificarStock(): void {
        const cantidadControl = this.formularioTransaccion.get('cantidad');
        if (!cantidadControl) return; // Comprobación de seguridad

        // Primero borra el error de stock anterior
        if (cantidadControl.hasError('stockInsuficiente')) {
            const errors = cantidadControl.errors || {};
            delete errors['stockInsuficiente'];
            cantidadControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }

        const productoId = this.formularioTransaccion.get('productoId')?.value;
        const cantidad = cantidadControl.value;
        const tipoId = this.formularioTransaccion.get('tipoTransaccionId')?.value;

        if (!productoId || !cantidad || !tipoId || cantidad <= 0) return; // No comprueba si faltan datos o no son válidos

        // Verifica el stock únicamente para transacciones de tipo “Venta”
        if (tipoId === this.TIPO_VENTA_ID) {
            const productoSeleccionado = this.productos.find(p => p.id === productoId);

            if (productoSeleccionado) {
                let stockDisponibleReal = productoSeleccionado.stock;

                // *** Lógica crucial de ajuste de existencias para la edición ***
                // Si estamos editando el producto *original* de esta transacción Y la transacción *original* fue una VENTA,
                // necesitamos agregar temporalmente la cantidad original al stock disponible para la verificación
                if (this.transaccionOriginal && this.productoOriginal &&
                    this.transaccionOriginal.tipoTransaccionId === this.TIPO_VENTA_ID && // Originalmente era una venta
                    this.productoOriginal.id === productoId) { // Es el mismo producto que empezamos a editar

                    stockDisponibleReal += this.productoOriginal.cantidad; // Agrega nuevamente el monto original
                    console.log(`Ajustando stock para verificación: ${productoSeleccionado.stock} (actual) + ${this.productoOriginal.cantidad} (original) = ${stockDisponibleReal}`);
                }
                // *** Fin de la lógica de ajuste ***

                if (stockDisponibleReal < cantidad) {
                    console.warn(`Stock insuficiente: ${stockDisponibleReal} disponible < ${cantidad} solicitado.`);
                    cantidadControl.setErrors({ ...(cantidadControl.errors || {}), stockInsuficiente: true });
                } else {
                    console.log(`Stock suficiente: ${stockDisponibleReal} disponible >= ${cantidad} solicitado.`);
                    // La lógica de limpieza al inicio se encarga de eliminar el error si ahora es suficiente
                }
            }
        }
    }

    calcularPrecioTotal(): number {
        const cantidad = this.formularioTransaccion.get('cantidad')?.value || 0;
        const precioUnitario = this.formularioTransaccion.get('precioUnitario')?.value || 0;
        // Agrega una verificación para garantizar que los tipos sean números antes de multiplicar
        const total = (typeof cantidad === 'number' && typeof precioUnitario === 'number')
            ? cantidad * precioUnitario
            : 0;
        return total;
    }

    onSubmit(): void {
        this.formularioTransaccion.markAllAsTouched(); // Marca todos los campos para comentarios de validación

        if (this.formularioTransaccion.invalid) {
            console.log('Formulario inválido. Detalles:', this.formularioTransaccion.errors);
            // Registra (log) errores detallados por control
            Object.keys(this.formularioTransaccion.controls).forEach(key => {
                const controlErrors = this.formularioTransaccion.get(key)?.errors;
                if (controlErrors != null) {
                    console.log('Control:', key, 'Errors:', controlErrors);
                }
            });
            alert('El formulario contiene errores. Por favor, revise los campos marcados.');
            return;
        }

        // Prepara datos para su envío (submission)
        // Se asegura de enviar el ID correcto de nombre del campo esperado por la API de backend
        const transaccionParaActualizar: Partial<Transaccion> = { // Usa Partial<Transaccion> o un DTO especifico
            // El ID se pasa en el método URL/servicio, generalmente no es necesaria en el body para actualizar (PUT)
            tipoTransaccionId: this.formularioTransaccion.value.tipoTransaccionId,
            productoId: this.formularioTransaccion.value.productoId,
            cantidad: this.formularioTransaccion.value.cantidad,
            precioUnitario: this.formularioTransaccion.value.precioUnitario,
            precioTotal: this.calcularPrecioTotal(),
            detalle: this.formularioTransaccion.value.detalle,
            // Incluye fecha si el backend lo espera, de lo contrario, podría actualizarlo en el lado del servidor
            // fecha: new Date() // O conserva la fecha original? depende de los requisitos
        };


        console.log('Datos de transacción a actualizar:', JSON.stringify(transaccionParaActualizar, null, 2));

        // Llama al servicio
        this.transaccionService.actualizarTransaccion(this.transaccionId, transaccionParaActualizar as Transaccion).subscribe({
            next: (response) => {
                console.log('Transacción actualizada con éxito:', response);
                alert('Transacción actualizada exitosamente!');
                this.router.navigate(['/transacciones']);
            },
            error: (error) => {
                console.error('Error al actualizar la transacción - Detalles:', error);
                // Proporciona comentarios específicos si es posible
                let errorMsg = 'Error desconocido al actualizar la transacción.';
                if (error.error) {
                    // Comprueba si el backend envía mensajes de error estructurados
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
