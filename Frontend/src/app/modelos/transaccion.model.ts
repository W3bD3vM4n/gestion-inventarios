export interface Transaccion {
    id: number;
    fecha: Date;
    tipoTransaccion: string;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    detalle?: string;
}
