import { createReducer, on } from '@ngrx/store';
import type {
  EstadoDocumento,
  EstadoSolicitud,
  SolicitudLicencia,
} from '../../models/estados-tramites';
import {
  puedeCambiarEstadoDocumento,
  puedeCambiarEstadoSolicitud,
} from '../../models/maquina-estados';
import {
  archivoSeleccionado,
  estadoDocumentoActualizado,
  estadoSolicitudActualizado,
  observacionDocumentoActualizada,
} from './solicitud.actions';

export interface SolicitudState {
  solicitudActual: SolicitudLicencia;
}

export const initialSolicitudState: SolicitudState = {
  solicitudActual: {
    id: 'prototipo-local',
    estado: 'presentada',
    documentos: [
      { tipo: 'dni', obligatorio: true, estado: 'pendienteCarga' },
      { tipo: 'formularioC01', obligatorio: true, estado: 'pendienteCarga' },
      { tipo: 'antecedentes', obligatorio: true, estado: 'pendienteCarga' },
      { tipo: 'comprobantePago', obligatorio: false, estado: 'pendienteCarga' },
    ],
  },
};

export const solicitudReducer = createReducer(
  initialSolicitudState,

  on(archivoSeleccionado, (state, { tipo, nombreArchivo }) => ({
    ...state,
    solicitudActual: {
      ...state.solicitudActual,
      documentos: state.solicitudActual.documentos.map((documento) =>
        documento.tipo === tipo ? { ...documento, nombreArchivo } : documento,
      ),
    },
  })),

  on(observacionDocumentoActualizada, (state, { tipo, observacion }) => ({
    ...state,
    solicitudActual: {
      ...state.solicitudActual,
      documentos: state.solicitudActual.documentos.map((documento) =>
        documento.tipo === tipo ? { ...documento, observacion } : documento,
      ),
    },
  })),

  on(estadoDocumentoActualizado, (state, { tipo, estado }) => {
    const documentoActual = state.solicitudActual.documentos.find(
      (documento) => documento.tipo === tipo,
    );

    if (
      !documentoActual ||
      !puedeCambiarEstadoDocumento(
        documentoActual.estado as EstadoDocumento,
        estado as EstadoDocumento,
      )
    ) {
      return state;
    }

    return {
      ...state,
      solicitudActual: {
        ...state.solicitudActual,
        documentos: state.solicitudActual.documentos.map((documento) =>
          documento.tipo === tipo ? { ...documento, estado } : documento,
        ),
      },
    };
  }),

  on(estadoSolicitudActualizado, (state, { estado }) => {
    if (
      !puedeCambiarEstadoSolicitud(
        state.solicitudActual.estado as EstadoSolicitud,
        estado as EstadoSolicitud,
      )
    ) {
      return state;
    }

    return {
      ...state,
      solicitudActual: {
        ...state.solicitudActual,
        estado,
      },
    };
  }),
);
