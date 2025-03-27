import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductosComponent } from './paginas/productos/productos.component';
import { AgregarProductoComponent } from './paginas/productos/agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './paginas/productos/editar-producto/editar-producto.component';

const routes: Routes = [
    { path: 'productos', component: ProductosComponent },
    { path: 'agregar-producto', component: AgregarProductoComponent },
    { path: 'editar-producto/:id', component: EditarProductoComponent },
    { path: '', redirectTo: '/productos', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
