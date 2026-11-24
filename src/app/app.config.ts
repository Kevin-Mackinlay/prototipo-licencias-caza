import {
  ApplicationConfig,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActionReducer, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { localStorageSync } from 'ngrx-store-localstorage';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import type { SolicitudState } from './store/solicitud/solicitud.reducer';
import { solicitudReducer } from './store/solicitud/solicitud.reducer';

interface AppState {
  solicitud: SolicitudState;
}

function serializarSolicitud(state: SolicitudState): SolicitudState {
  return {
    ...state,
    solicitudActual: {
      ...state.solicitudActual,
      documentos: state.solicitudActual.documentos.map((documento) => ({
        tipo: documento.tipo,
        obligatorio: documento.obligatorio,
        estado: documento.estado,
        ...(documento.fechaEmision !== undefined ? { fechaEmision: documento.fechaEmision } : {}),
        ...(documento.observacion !== undefined ? { observacion: documento.observacion } : {}),
      })),
    },
  };
}

export function localStorageSyncReducer(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
  return localStorageSync({
    keys: [{ solicitud: { serialize: serializarSolicitud } }],
    rehydrate: true,
  })(reducer);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Lara,
      },
    }),
    provideStore({ solicitud: solicitudReducer }, { metaReducers: [localStorageSyncReducer] }),
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
  ],
};
