import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaProductosComponent } from './componentes/lista-productos/lista-productos.component';
import { DetalleProductosComponent } from './componentes/detalle-productos/detalle-productos.component';
import { ProductosComponent } from './paginas/productos/productos.component';
import { HttpClientModule } from '@angular/common/http';
import { AgregarProductoComponent } from './paginas/productos/agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './paginas/productos/editar-producto/editar-producto.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    ListaProductosComponent,
    DetalleProductosComponent,
    ProductosComponent,
    AgregarProductoComponent,
    EditarProductoComponent
  ],
  imports: [
    BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
