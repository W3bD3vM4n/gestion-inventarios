export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string;
    categoriaId: number;
    imagen?: string;
    precio: number;
    stock: number;
}
