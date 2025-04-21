import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../../modelos/producto.model';
import { ProductoService } from '../../../servicios/producto.service';
import { TipoTransaccion } from '../../../modelos/tipo-transaccion.model';
import { TransaccionService } from '../../../servicios/transaccion.service';

@Component({
    selector: 'app-agregar-transaccion',
    standalone: false,
    templateUrl: './agregar-transaccion.component.html',
    styleUrl: './agregar-transaccion.component.css'
})
export class AgregarTransaccionComponent implements OnInit {
    formularioTransaccion!: FormGroup;
    productos: Producto[] = [];
    tiposTransaccion: TipoTransaccion[] = [];
    readonly TIPO_VENTA_ID = 2; // Asigna el ID correspondiente a las ventas

    constructor(
        private generarFormulario: FormBuilder,
        private productoService: ProductoService,
        private transaccionService: TransaccionService,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.iniciarFormulario();
        this.cargarProductos();
        this.cargarTiposTransaccion();

        // Agrega listeners para cambios en producto, cantidad y tipo de transacción
        this.formularioTransaccion.get('tipoTransaccionId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe(() => this.verificarStock());
        this.formularioTransaccion.get('productoId')?.valueChanges.subscribe(value => {
            console.log('ID de producto cambiado:', value);
            this.actualizarPrecioUnitario();
        });
        this.formularioTransaccion.get('cantidad')?.valueChanges.subscribe(() => this.verificarStock());
    }

    iniciarFormulario(): void {
        this.formularioTransaccion = this.generarFormulario.group({
            tipoTransaccionId: ['', Validators.required],
            productoId: ['', Validators.required],
            cantidad: ['', [Validators.required, Validators.min(1)]],
            precioUnitario: ['', [Validators.required, Validators.min(0.01)]],
            detalle: ['']
        });
    }

    cargarProductos(): void {
        console.log('Iniciando carga de productos...');
        this.productoService.obtenerProductos().subscribe({
            next: (productos) => {
                this.productos = productos;
                console.log('Productos cargados:', productos);
                // Registra la estructura del primer producto
                if (productos.length > 0) {
                    console.log('Estructura del primer producto:', JSON.stringify(productos[0]));
                }
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
                alert('No se pudieron cargar los productos');
            }
        });
    }

    cargarTiposTransaccion(): void {
        this.transaccionService.obtenerTiposTransaccion().subscribe({
            next: (tipos) => {
                this.tiposTransaccion = tipos;
            },
            error: (error) => {
                console.error('Error al cargar tipos de transacción:', error);
                alert('No se pudieron cargar los tipos de transacción');
            }
        });
    }

    verificarStock(): void {
        const productoId = this.formularioTransaccion.get('productoId')?.value;
        const cantidad = this.formularioTransaccion.get('cantidad')?.value;
        const tipoId = this.formularioTransaccion.get('tipoTransaccionId')?.value;

        if (!productoId || !cantidad || !tipoId) return;

        // Solo verificar stock para transacciones de venta
        if (tipoId === this.TIPO_VENTA_ID) {
            const productoSeleccionado = this.productos.find(p => p.id === productoId);

            if (productoSeleccionado && productoSeleccionado.stock < cantidad) {
                this.formularioTransaccion.get('cantidad')?.setErrors({ stockInsuficiente: true });
            }
        }
    }

    actualizarPrecioUnitario(): void {
        const productoId = this.formularioTransaccion.get('productoId')?.value;
        console.log('Llamando a actualizarPrecioUnitario, productoId:', productoId);
        console.log('Tipo de productoId:', typeof productoId);

        if (!productoId) {
            console.log('No se seleccionó ningún producto, regresando');
            return;
        }

        // Registra todos los ID de productos para compararlos con el ID seleccionado
        console.log('IDs de productos disponibles:', this.productos.map(p => ({ id: p.id, tipo: typeof p.id })));

        // Prueba un enfoque más seguro en cuanto a tipos
        let productoSeleccionado: Producto | undefined;

        // Prueba comparando ambos string y números
        // let productoSeleccionado = this.productos.find(p => p.id === productoId);

        // Convierte a número para comparar si es un string
        const idToCompare = typeof productoId === 'string' ? Number(productoId) : productoId;

        // Utiliza el valor convertido para la búsqueda
        productoSeleccionado = this.productos.find(p => p.id === idToCompare);

        console.log('Producto seleccionado:', productoSeleccionado);

        if (productoSeleccionado) {
            console.log('Estableciendo precioUnitario a:', productoSeleccionado.precio);
            this.formularioTransaccion.get('precioUnitario')?.setValue(productoSeleccionado.precio);
        } else {
            console.log('Producto no encontrado en el array de productos');
            // Registra todo el array de productos para ver con qué estamos tratando
            console.log('Array completo de productos:', this.productos);
        }
    }

    calcularPrecioTotal(): number {
        const cantidad = this.formularioTransaccion.get('cantidad')?.value || 0;
        const precioUnitario = this.formularioTransaccion.get('precioUnitario')?.value || 0;
        return cantidad * precioUnitario;
    }

    onSubmit(): void {
        if (this.formularioTransaccion.invalid) return;

        const transaccion = {
            ...this.formularioTransaccion.value,
            fecha: new Date(),
            precioTotal: this.calcularPrecioTotal()
        };

        this.transaccionService.crearTransaccion(transaccion).subscribe({
            next: (response) => {
                console.log('Transacción guardada:', response);
                alert('Transacción agregada exitosamente!');
                this.router.navigate(['/transacciones']); // Redirecciona a Lista de Transacciones
            },
            error: (error) => {
                console.error('Error al guardar la transacción:', error);
                alert('Error al agregar la transacción.');
            }
        });
    }
}
