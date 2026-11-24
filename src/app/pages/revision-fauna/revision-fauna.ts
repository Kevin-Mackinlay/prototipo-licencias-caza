import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import type {
  EstadoDocumento,
  EstadoSolicitud,
  TipoDocumento,
} from '../../models/estados-tramites';
import type { SolicitudState } from '../../store/solicitud/solicitud.reducer';
import {
  estadoDocumentoActualizado,
  estadoSolicitudActualizado,
} from '../../store/solicitud/solicitud.actions';

interface AppState {
  solicitud: SolicitudState;
}

@Component({
  selector: 'app-revision-fauna',
  imports: [RouterLink],
  templateUrl: './revision-fauna.html',
  styleUrl: './revision-fauna.scss',
})
export class RevisionFauna {
  private readonly store = inject(Store) as Store<AppState>;

  protected readonly solicitudActual = this.store.selectSignal(
    (state) => state.solicitud.solicitudActual,
  );

  protected mensaje = '';

  protected puedeFinalizarRevision(): boolean {
    const solicitud = this.solicitudActual();

    if (solicitud.estado !== 'enRevision') {
      return false;
    }

    const documentosARevisar = solicitud.documentos.filter(
      (documento) => documento.obligatorio || documento.estado !== 'pendienteCarga',
    );

    return documentosARevisar.every(
      (documento) =>
        documento.estado === 'aprobado' ||
        documento.estado === 'observado' ||
        documento.estado === 'rechazado',
    );
  }

  protected cambiarEstadoDocumento(tipo: TipoDocumento, estado: EstadoDocumento): void {
    this.store.dispatch(estadoDocumentoActualizado({ tipo, estado }));
    this.mensaje = '';
  }

  protected finalizarRevision(): void {
    const solicitud = this.solicitudActual();

    if (!this.puedeFinalizarRevision()) {
      this.mensaje = 'Primero revisá todos los documentos obligatorios y los adjuntos.';
      return;
    }

    const documentosObligatorios = solicitud.documentos.filter(
      (documento) => documento.obligatorio,
    );

    let estadoFinal: EstadoSolicitud = 'aprobada';

    if (documentosObligatorios.some((documento) => documento.estado === 'rechazado')) {
      estadoFinal = 'rechazada';
    } else if (documentosObligatorios.some((documento) => documento.estado === 'observado')) {
      estadoFinal = 'observada';
    }

    this.store.dispatch(estadoSolicitudActualizado({ estado: 'revisada' }));
    this.store.dispatch(estadoSolicitudActualizado({ estado: estadoFinal }));

    this.mensaje = `Revisión finalizada. Estado de la solicitud: ${this.etiquetaEstadoSolicitud(estadoFinal)}.`;
  }

  protected etiquetaTipoDocumento(tipo: TipoDocumento): string {
    const etiquetas: Record<TipoDocumento, string> = {
      dni: 'DNI',
      formularioC01: 'Formulario C-01 SFS',
      antecedentes: 'Antecedentes',
      comprobantePago: 'Comprobante de pago',
    };

    return etiquetas[tipo];
  }

  protected etiquetaEstadoDocumento(estado: EstadoDocumento): string {
    const etiquetas: Record<EstadoDocumento, string> = {
      pendienteCarga: 'Pendiente de carga',
      pendienteRevision: 'Pendiente de revisión',
      aprobado: 'Aprobado',
      observado: 'Observado',
      rechazado: 'Rechazado',
    };

    return etiquetas[estado];
  }

  protected etiquetaEstadoSolicitud(estado: EstadoSolicitud): string {
    const etiquetas: Record<EstadoSolicitud, string> = {
      presentada: 'Presentada',
      completa: 'Completa',
      enRevision: 'En revisión',
      revisada: 'Revisada',
      observada: 'Observada',
      rechazada: 'Rechazada',
      aprobada: 'Aprobada',
      emitida: 'Emitida',
    };

    return etiquetas[estado];
  }
}
