import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaProductosComponent } from './componentes/lista-productos/lista-productos.component';
import { DetalleProductosComponent } from './componentes/detalle-productos/detalle-productos.component';
import { ProductosComponent } from './paginas/productos/productos.component';

@NgModule({
  declarations: [
    AppComponent,
    ListaProductosComponent,
    DetalleProductosComponent,
    ProductosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
