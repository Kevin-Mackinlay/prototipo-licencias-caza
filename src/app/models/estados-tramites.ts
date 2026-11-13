export type TipoDocumento = 'dni' | 'formularioC01' | 'antecedentes' | 'comprobantePago';

export type EstadoDocumento =
  | 'pendienteCarga'
  | 'pendienteRevision'
  | 'aprobado'
  | 'observado'
  | 'rechazado';

export type EstadoSolicitud =
  | 'presentada'
  | 'completa'
  | 'enRevision'
  | 'revisada'
  | 'observada'
  | 'rechazada'
  | 'aprobada'
  | 'emitida';

export interface DocumentoSolicitud {
  tipo: TipoDocumento;
  obligatorio: boolean;
  estado: EstadoDocumento;
  nombreArchivo?: string;
  fechaEmision?: string;
  observacion?: string;
}

export interface SolicitudLicencia {
  id: string;
  estado: EstadoSolicitud;
  documentos: DocumentoSolicitud[];
}
