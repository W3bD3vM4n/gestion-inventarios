import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto.model';
import { Observable } from 'rxjs';
import { Categoria } from '../modelos/categoria.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = `${environment.productosApiUrl}/api/Producto`;

    constructor(private http: HttpClient) { }

    obtenerProductos(filters?: any): Observable<Producto[]> {
        let params = new HttpParams();
        if (filters) {
            // Agrega filtros a los parámetros solo si tienen un valor
            // IMPORTANTE: debe coincidir con los nombres de los parámetros del controlador
            if (filters.nombre) {
                params = params.set('nombre', filters.nombre);
            }
            if (filters.categoriaId) {
                params = params.set('categoriaId', filters.categoriaId.toString());
            }
            if (filters.precioMin) {
                params = params.set('precioMin', filters.precioMin.toString());
            }
            if (filters.precioMax) {
                params = params.set('precioMax', filters.precioMax.toString());
            }
            // Agrega otros filtros según sea necesario
        }
        // Envia solicitud con parámetros
        return this.http.get<Producto[]>(this.apiUrl, { params });
    }

    obtenerCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.apiUrl}/Categorias`);
    }

    obtenerProductoPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/${id}`);
    }

    crearProducto(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(this.apiUrl, producto);
    }

    actualizarProducto(id: number, producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
    }

    eliminarProducto(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
