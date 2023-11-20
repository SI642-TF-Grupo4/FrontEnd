import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginUserComponent } from './components/login-user/login-user.component';
import { RegisterComponent } from './components/register/register.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ListaBancoComponent } from './components/lista-banco/lista-banco.component';
import { DescripcionComponent } from './components/descripcion/descripcion.component';
import { SimulationComponent } from './components/simulation/simulation.component';


const routes: Routes = [
  { path: 'login', component: LoginUserComponent },
  { path: '', component: LoginUserComponent },
  { path: 'registro-usuario', component: RegisterComponent },
  {
    path: 'home/:id', component: HomePageComponent,
    children: [
      { path: '', component: DescripcionComponent },
      { path: 'entidades-financieras', component: ListaBancoComponent },
      { path: 'simulador/:et', component: SimulationComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
