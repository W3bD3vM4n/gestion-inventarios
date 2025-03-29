import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto.model';
import { Observable } from 'rxjs';
import { Categoria } from '../modelos/categoria.model';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private baseUrl = 'https://localhost:7086/api/Producto';

    constructor(private http: HttpClient) { }

    obtenerProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.baseUrl);
    }

    obtenerProductoPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.baseUrl}/${id}`);
    }

    obtenerCategorias(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.baseUrl}/Categorias`);
    }

    guardarProducto(producto: Producto): Observable<Producto> {
        return this.http.post<Producto>(this.baseUrl, producto);
    }

    actualizarProducto(id: number, producto: Producto): Observable<Producto> {
        return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto);
    }

    eliminarProducto(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }
}
