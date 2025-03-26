import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Producto } from '../modelos/producto.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = 'https://localhost:7086/api/Producto';

    constructor(private http: HttpClient) { }

    obtenerProductos(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.apiUrl);
    }
}
