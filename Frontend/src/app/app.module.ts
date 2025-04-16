import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ListaProductosComponent } from './componentes/lista-productos/lista-productos.component';
import { DetalleProductosComponent } from './componentes/detalle-productos/detalle-productos.component';
import { ProductosComponent } from './paginas/productos/productos.component';
import { HttpClientModule } from '@angular/common/http';
import { AgregarProductoComponent } from './paginas/productos/agregar-producto/agregar-producto.component';
import { EditarProductoComponent } from './paginas/productos/editar-producto/editar-producto.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AgregarTransaccionComponent } from './paginas/transacciones/agregar-transaccion/agregar-transaccion.component';
import { EditarTransaccionComponent } from './paginas/transacciones/editar-transaccion/editar-transaccion.component';
import { ListaTransaccionesComponent } from './componentes/lista-transacciones/lista-transacciones.component';
import { TransaccionesComponent } from './paginas/transacciones/transacciones.component';
import { HeaderComponent } from './componentes/header/header.component';
import { HomeComponent } from './componentes/home/home.component';

@NgModule({
    declarations: [
        AppComponent,
        ListaProductosComponent,
        DetalleProductosComponent,
        ProductosComponent,
        AgregarProductoComponent,
        EditarProductoComponent,
        AgregarTransaccionComponent,
        EditarTransaccionComponent,
        ListaTransaccionesComponent,
        TransaccionesComponent,
        HeaderComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule,
        TableModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
