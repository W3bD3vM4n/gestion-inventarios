import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './paginas/productos/productos.component';
import { AgregarProductoComponent } from './paginas/productos/agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './paginas/productos/editar-producto/editar-producto.component';
import { TransaccionesComponent } from './paginas/transacciones/transacciones.component';
import { AgregarTransaccionComponent } from './paginas/transacciones/agregar-transaccion/agregar-transaccion.component';
import { EditarTransaccionComponent } from './paginas/transacciones/editar-transaccion/editar-transaccion.component';
import { HomeComponent } from './componentes/home/home.component';

const routes: Routes = [
    { path: 'productos', component: ProductosComponent },
    { path: 'agregar-producto', component: AgregarProductoComponent },
    { path: 'editar-producto/:id', component: EditarProductoComponent },
    { path: 'transacciones', component: TransaccionesComponent },
    { path: 'agregar-transaccion', component: AgregarTransaccionComponent },
    { path: 'editar-transaccion/:id', component: EditarTransaccionComponent },
    { path: '', component: HomeComponent }, // // Establece ruta predeterminada
    { path: '**', redirectTo: '/' }, // Redirige a Home para rutas no válidas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
