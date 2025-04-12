import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap, finalize } from 'rxjs/operators';

import { Transaccion } from '../../modelos/transaccion.model';
import { TipoTransaccion } from '../../modelos/tipo-transaccion.model';
import { Producto } from '../../modelos/producto.model';
import { TransaccionService } from '../../servicios/transaccion.service';
import { ProductoService } from '../../servicios/producto.service';

// Define una interfaz para filtros
interface TransaccionFiltros {
    fechaInicio: string | null;
    fechaFin: string | null;
    tipoTransaccionId: number | null;
    productoId: number | null;
    // Agrega más filtros según sea necesario
}

@Component({
    selector: 'app-lista-transacciones',
    standalone: false,
    templateUrl: './lista-transacciones.component.html',
    styleUrl: './lista-transacciones.component.css'
})
export class ListaTransaccionesComponent implements OnInit, OnDestroy {
    transacciones: Transaccion[] = [];
    tiposTransaccionDisponibles: TipoTransaccion[] = [];
    productosDisponibles: Producto[] = [];

    isLoading = false;
    errorMessage: string | null = null;
    tiposLoadingError: string | null = null;
    productosLoadingError: string | null = null;

    // Objeto de estado de filtro
    filtros: TransaccionFiltros = {
        fechaInicio: null,
        fechaFin: null,
        tipoTransaccionId: null,
        productoId: null
    };

    // Refente al manejo de cambios de filtro con antirrebote
    private filterSubject = new Subject<void>();
    private destroy$ = new Subject<void>(); // Para darse de baja

    constructor(
        private transaccionService: TransaccionService,
        private productoService: ProductoService
    ) { }

    ngOnInit() {
        this.cargarDatosParaFiltros(); // Carga datos al iniciar

        // Subscribe filtros cambiados con antirrebote
        this.filterSubject.pipe(
            debounceTime(400),
            tap(() => {
                this.isLoading = true;
                this.errorMessage = null;
            }),
            switchMap(() => this.transaccionService.obtenerTransacciones(this.filtros).pipe(
                catchError(error => {
                    console.error('Error al cargar las transacciones:', error);
                    this.errorMessage = 'No se pudieron cargar las transacciones. Intente de nuevo.';
                    return of([]);
                }),
                finalize(() => {
                    this.isLoading = false;
                })
            )),
            takeUntil(this.destroy$)
        ).subscribe(data => {
            this.transacciones = data;
        });

        // Provoca carga inicial de datos
        this.filterSubject.next();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarDatosParaFiltros() {
        this.tiposLoadingError = null;
        this.productosLoadingError = null;

        // Usa forkJoin para cargar ambos paralelamente
        forkJoin({
            tipos: this.transaccionService.obtenerTiposTransaccion().pipe(catchError(err => {
                console.error('Error al cargar tipos de transacción:', err);
                this.tiposLoadingError = 'No se pudieron cargar los tipos.';
                return of([]);
            })),
            productos: this.productoService.obtenerProductos().pipe(catchError(err => { // Obtiene todos los productos por filtro
                console.error('Error al cargar productos:', err);
                this.productosLoadingError = 'No se pudieron cargar los productos.';
                return of([]);
            }))
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.tiposTransaccionDisponibles = result.tipos;
                this.productosDisponibles = result.productos;
            });
    }

    // Método llamado cuando cambia cualquier entrada de filtro
    aplicarFiltros() {
        this.filterSubject.next();
    }

    limpiarFiltros() {
        // Restablecer objeto de filtro
        this.filtros = {
            fechaInicio: null,
            fechaFin: null,
            tipoTransaccionId: null,
            productoId: null
        };
        this.aplicarFiltros(); // Recarga datos con filtros borrados
    }

    obtenerNombreProducto(productoId: number | null | undefined): string {
        if (productoId === null || productoId === undefined) {
            return 'N/A';
        }

        if (!this.productosDisponibles || this.productosDisponibles.length === 0) {
            return '...';
        }

        const foundProducto = this.productosDisponibles.find(prod => prod.id === productoId);
        return foundProducto ? foundProducto.nombre : 'Desconocido';
    }

    eliminarTransaccion(id: number) {
        // Confirmar borrado
        const confirmacion = confirm('¿Seguro de que desea eliminar esta transacción?');

        if (confirmacion) {
            this.isLoading = true; // Opcionalmente muestra carga durante eliminación
            this.transaccionService.eliminarTransaccion(id).pipe(
                takeUntil(this.destroy$),
                finalize(() => this.isLoading = false)
            ).subscribe({
                next: () => {
                    // Eliminar producto de la lista LOCALMENTE
                    this.transacciones = this.transacciones.filter(t => t.id !== id);
                    // Opcionalmente, recarga si la lógica del lado del servidor afecta la vista
                    // this.aplicarFiltros();
                    alert('Transacción eliminada exitosamente');
                },
                error: (error) => {
                    console.error('Error al eliminar transacción:', error);
                    alert('No se pudo eliminar la transacción.');
                }
            });
        }
    }

    // Función trackBy para el rendimiento de ngFor
    trackByTransaccionId(index: number, transaccion: Transaccion): number {
        return transaccion.id;
    }
}
