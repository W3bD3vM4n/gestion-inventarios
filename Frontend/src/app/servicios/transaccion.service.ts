import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaccion } from '../modelos/transaccion.model';
import { TipoTransaccion } from '../modelos/tipo-transaccion.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {

    private apiUrl = environment.transaccionesApiUrl;

    constructor(private http: HttpClient) { }

    obtenerTransacciones(): Observable<Transaccion[]> {
        return this.http.get<Transaccion[]>(`${this.apiUrl}/Transacciones`);
    }

    obtenerTransaccion(id: number): Observable<Transaccion> {
        return this.http.get<Transaccion>(`${this.apiUrl}/Transacciones/${id}`);
    }

    guardarTransaccion(transaccion: Transaccion): Observable<Transaccion> {
        return this.http.post<Transaccion>(`${this.apiUrl}/Transacciones`, transaccion);
    }

    actualizarTransaccion(id: number, transaccion: Transaccion): Observable<any> {
        return this.http.put(`${this.apiUrl}/Transacciones/${id}`, transaccion);
    }

    eliminarTransaccion(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/Transacciones/${id}`);
    }

    obtenerTiposTransaccion(): Observable<TipoTransaccion[]> {
        return this.http.get<TipoTransaccion[]>(`${this.apiUrl}/TiposTransaccion`);
    }
}
