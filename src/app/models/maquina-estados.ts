import type { EstadoDocumento, EstadoSolicitud } from './estados-tramites';

const transicionesSolicitud: Record<EstadoSolicitud, readonly EstadoSolicitud[]> = {
  presentada: ['completa'],
  completa: ['enRevision'],
  enRevision: ['revisada'],
  revisada: ['observada', 'rechazada', 'aprobada'],
  observada: ['completa'],
  rechazada: [],
  aprobada: ['emitida'],
  emitida: [],
};

const transicionesDocumento: Record<EstadoDocumento, readonly EstadoDocumento[]> = {
  pendienteCarga: ['pendienteRevision'],
  pendienteRevision: ['aprobado', 'observado', 'rechazado'],
  aprobado: [],
  observado: ['pendienteRevision'],
  rechazado: ['pendienteRevision'],
};

export function puedeCambiarEstadoSolicitud(
  estadoActual: EstadoSolicitud,
  nuevoEstado: EstadoSolicitud,
): boolean {
  return transicionesSolicitud[estadoActual].includes(nuevoEstado);
}

export function puedeCambiarEstadoDocumento(
  estadoActual: EstadoDocumento,
  nuevoEstado: EstadoDocumento,
): boolean {
  return transicionesDocumento[estadoActual].includes(nuevoEstado);
}
