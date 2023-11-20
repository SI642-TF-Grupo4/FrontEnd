import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularMaterialModule } from './components/shared/angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginUserComponent } from './components/login-user/login-user.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RegisterComponent } from './components/register/register.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ListaBancoComponent } from './components/lista-banco/lista-banco.component';
import { DescripcionComponent } from './components/descripcion/descripcion.component';
import { SimulationComponent } from './components/simulation/simulation.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginUserComponent,
    RegisterComponent,
    SideNavComponent,
    HomePageComponent,
    ListaBancoComponent,
    DescripcionComponent,
    SimulationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
