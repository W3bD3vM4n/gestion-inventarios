import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap, finalize } from 'rxjs/operators';

import { Producto } from '../../modelos/producto.model';
import { Categoria } from '../../modelos/categoria.model';
import { ProductoService } from '../../servicios/producto.service';

// Define una interfaz para filtros
interface ProductoFiltros {
    nombre: string | null;
    categoriaId: number | null;
    precioMin: number | null;
    precioMax: number | null;
    // Agrega más filtros según sea necesario
}

@Component({
    selector: 'app-lista-productos',
    standalone: false,
    templateUrl: './lista-productos.component.html',
    styleUrl: './lista-productos.component.css'
})
export class ListaProductosComponent implements OnInit, OnDestroy {
    productos: Producto[] = [];
    categoriasDisponibles: Categoria[] = [];
    isLoading = false;
    errorMessage: string | null = null;
    categoriasLoadingError: string | null = null;

    // Objeto de estado de filtro
    filtros: ProductoFiltros = {
        nombre: null,
        categoriaId: null,
        precioMin: null,
        precioMax: null
    };

    // Refente al manejo de cambios de filtro con antirrebote
    private filterSubject = new Subject<void>();
    private destroy$ = new Subject<void>(); // Para darse de baja

    constructor(private productoService: ProductoService) { }

    ngOnInit() {
        this.cargarCategorias(); // Carga categorias al iniciar

        // Subscribe filtros cambiados con antirrebote
        this.filterSubject.pipe(
            debounceTime(400), // Espere una pausa de 400 ms en los eventos
            // distinctUntilChanged(), // Solo emitir si el valor cambió
            tap(() => {
                this.isLoading = true; // Establece la carga antes de la solicitud
                this.errorMessage = null; // Borra errores anteriores
            }),
            switchMap(() => this.productoService.obtenerProductos(this.prepareFiltersForApi()).pipe(
                catchError(error => {
                    console.error('Error al cargar los productos:', error);
                    this.errorMessage = 'No se pudieron cargar los productos. Intente de nuevo.';
                    // Devuelve un array vacio en caso de error para mantener activa la transmisión
                    return of([]); // Uso de 'of' proveniente de rxjs
                }),
                finalize(() => {
                    this.isLoading = false; // Se asegura que la carga sea falsa cuando el observable se complete o se produzcan errores
                })
            )),
            takeUntil(this.destroy$) // Darse de baja cuando se destruye el componente
        ).subscribe(data => {
            this.productos = data;
        });

        // Provoca carga inicial de datos (con filtros por defecto/vacios)
        this.filterSubject.next();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Método llamado cuando cambia cualquier entrada de filtro
    aplicarFiltros() {
        this.filterSubject.next(); // Activar la carga antirrebote
    }

    // Preparar filtros antes de enviarlos a la API
    private prepareFiltersForApi(): Partial<ProductoFiltros> {
        const apiFilters: Partial<ProductoFiltros> = {};
        // Incluya únicamente filtros que tengan un valor distinto de non-null/non-empty
        if (this.filtros.nombre && this.filtros.nombre.trim() !== '') {
            apiFilters.nombre = this.filtros.nombre.trim();
        }
        if (this.filtros.categoriaId !== null && this.filtros.categoriaId !== undefined) { // Verifique si hay null/undefined específicamente para el ID 0 si acaso es válido
            apiFilters.categoriaId = this.filtros.categoriaId;
        }
        if (this.filtros.precioMin !== null && this.filtros.precioMin !== undefined) {
            apiFilters.precioMin = this.filtros.precioMin;
        }
        if (this.filtros.precioMax !== null && this.filtros.precioMax !== undefined) {
            apiFilters.precioMax = this.filtros.precioMax;
        }
        return apiFilters;
    }

    limpiarFiltros() {
        // Restablecer objeto de filtro
        this.filtros = {
            nombre: null,
            categoriaId: null,
            precioMin: null,
            precioMax: null
        };
        this.aplicarFiltros(); // Recarga datos con filtros borrados
    }

    cargarCategorias() {
        this.categoriasLoadingError = null;
        this.productoService.obtenerCategorias().pipe(
            takeUntil(this.destroy$) // Darse de baja al destruir
        ).subscribe({
            next: (data) => {
                this.categoriasDisponibles = data;
            },
            error: (error) => {
                console.error('Error al cargar categorías:', error);
                this.categoriasLoadingError = 'No se pudieron cargar las categorías para el filtro.';
                // Opcionalmente, deshabilite el DropDownMenu o muestre un mensaje cerca
            }
        });
    }

    obtenerNombreDeCategoria(categoryId: number | null | undefined): string {
        // Maneja el potencial null/undefined de categoryId
        if (categoryId === null || categoryId === undefined) {
            return 'N/A'; // Vacio '' o 'Sin categoría'
        }

        // Utiliza el array categoriasDisponibles del componente
        if (!this.categoriasDisponibles || this.categoriasDisponibles.length === 0) {
            return '...'; // Indica que las categorías no se han cargado aún o están vacías
        }

        const foundCategory = this.categoriasDisponibles.find(cat => cat.id === categoryId);
        return foundCategory ? foundCategory.nombre : 'Desconocida'; // O manejarlo según sea necesario
    }

    eliminarProducto(id: number) {
        // Confirmar borrado
        const confirmacion = confirm('¿Seguro de que desea eliminarlo?');

        if (confirmacion) {
            this.isLoading = true; // Opcionalmente muestra carga durante eliminación
            this.productoService.eliminarProducto(id).pipe(
                takeUntil(this.destroy$), // Darse de baja al destruir
                finalize(() => this.isLoading = false) // Indicador de parada de carga
            ).subscribe({
                next: () => {
                    // Eliminar producto de la lista LOCALMENTE después de una eliminación exitosa
                    this.productos = this.productos.filter(p => p.id !== id);
                    // Opcionalmente, recarga si la lógica del lado del servidor afecta la vista
                    // this.aplicarFiltros();
                    alert('Producto eliminado exitosamente'); // Considere usar un sistema de notificación menos intrusivo
                },
                error: (error) => {
                    console.error('Error al eliminar producto:', error);
                    alert('No se pudo eliminar el producto.');
                }
            });
        }
    }

    // Función trackBy para el rendimiento de ngFor
    trackByProductoId(index: number, producto: Producto): number {
        return producto.id;
    }
}
