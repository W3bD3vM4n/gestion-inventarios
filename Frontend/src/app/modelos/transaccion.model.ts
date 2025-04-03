export interface Transaccion {
    id: number;
    fecha: Date;
    tipoTransaccionId: number;
    // tipoTransaccion: string;
    productoId: number;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    detalle?: string;
}
