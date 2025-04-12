import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaccion } from '../modelos/transaccion.model';
import { TipoTransaccion } from '../modelos/tipo-transaccion.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
    private apiUrl = `${environment.transaccionesApiUrl}/api/Transaccion`;

    constructor(private http: HttpClient) { }

    obtenerTransacciones(filters?: any): Observable<Transaccion[]> {
        let params = new HttpParams();
        if (filters) {
            if (filters.fechaInicio) {
                // Formatea la fecha consistentemente (ejemplo: YYYY-MM-DD)
                params = params.set('fechaInicio', formatDate(filters.fechaInicio, 'yyyy-MM-dd', 'en-US'));
            }
            if (filters.fechaFin) {
                params = params.set('fechaFin', formatDate(filters.fechaFin, 'yyyy-MM-dd', 'en-US'));
            }
            if (filters.tipoTransaccionId) {
                params = params.set('tipoTransaccionId', filters.tipoTransaccionId.toString());
            }
            if (filters.productoId) {
                params = params.set('productoId', filters.productoId.toString());
            }
        }
        return this.http.get<Transaccion[]>(this.apiUrl, { params });
    }

    obtenerTiposTransaccion(): Observable<TipoTransaccion[]> {
        return this.http.get<TipoTransaccion[]>(`${this.apiUrl}/TipoTransacciones`);
    }

    obtenerTransaccionPorId(id: number): Observable<Transaccion> {
        return this.http.get<Transaccion>(`${this.apiUrl}/${id}`);
    }

    crearTransaccion(transaccion: Transaccion): Observable<Transaccion> {
        return this.http.post<Transaccion>(this.apiUrl, transaccion);
    }

    actualizarTransaccion(id: number, transaccion: Transaccion): Observable<Transaccion> {
        return this.http.put<Transaccion>(`${this.apiUrl}/${id}`, transaccion);
    }

    eliminarTransaccion(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
