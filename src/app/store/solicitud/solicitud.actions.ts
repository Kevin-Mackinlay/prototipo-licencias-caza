import { createAction, props } from '@ngrx/store';
import type {
  EstadoDocumento,
  EstadoSolicitud,
  TipoDocumento,
} from '../../models/estados-tramites';

export const archivoSeleccionado = createAction(
  '[Mis documentos] Archivo seleccionado',
  props<{ tipo: TipoDocumento; nombreArchivo: string }>(),
);

export const estadoDocumentoActualizado = createAction(
  '[Mis documentos] Estado de documento actualizado',
  props<{ tipo: TipoDocumento; estado: EstadoDocumento }>(),
);

export const estadoSolicitudActualizado = createAction(
  '[Solicitud] Estado actualizado',
  props<{ estado: EstadoSolicitud }>(),
);

export const observacionDocumentoActualizada = createAction(
  '[Revisión Fauna] Observación de documento actualizada',
  props<{ tipo: TipoDocumento; observacion: string }>(),
);