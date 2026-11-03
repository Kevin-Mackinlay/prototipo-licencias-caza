import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Solicitud } from './pages/solicitud/solicitud';

export const routes: Routes = [
  {
    path: '',
    component: Inicio,
    pathMatch: 'full',
  },
  {
    path: 'solicitud',
    component: Solicitud,
  }
];
