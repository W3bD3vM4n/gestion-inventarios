export interface Transaccion {
    id: number;
    fecha: Date;
    tipo_transaccion_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    precio_total: number;
    detalle?: string;
}
