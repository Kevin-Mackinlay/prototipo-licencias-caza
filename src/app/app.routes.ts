import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Solicitud } from './pages/solicitud/solicitud';
import { MisDocumentos } from './pages/mis-documentos/mis-documentos';
import { RevisionFauna } from './pages/revision-fauna/revision-fauna';

export const routes: Routes = [
  {
    path: '',
    component: Inicio,
    pathMatch: 'full',
  },
  {
    path: 'solicitud',
    component: Solicitud,
  },
  {
    path: 'mis-documentos',
    component: MisDocumentos,
  },
  {
    path: 'revision-fauna',
    component: RevisionFauna,
  },
];
