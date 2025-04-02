export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;
    categoria_id: number;
    imagen?: string;
    precio: number;
    stock: number;
}
