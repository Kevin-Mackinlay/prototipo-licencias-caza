import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { Store } from '@ngrx/store';

import type {
  EstadoDocumento,
  EstadoSolicitud,
  TipoDocumento,
} from '../../models/estados-tramites';
import type { SolicitudState } from '../../store/solicitud/solicitud.reducer';
import {
  archivoSeleccionado,
  estadoDocumentoActualizado,
  estadoSolicitudActualizado,
} from '../../store/solicitud/solicitud.actions';

interface AppState {
  solicitud: SolicitudState;
}

@Component({
  selector: 'app-mis-documentos',
  imports: [RouterLink, DatePickerModule, ReactiveFormsModule],
  templateUrl: './mis-documentos.html',
  styleUrl: './mis-documentos.scss',
})
export class MisDocumentos {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store) as Store<AppState>;

  protected readonly fechaMaxima = new Date();

  protected readonly solicitudActual = this.store.selectSignal(
    (state) => state.solicitud.solicitudActual,
  );

  protected readonly formulario = this.fb.group({
    numeroDni: ['', Validators.required],
    establecimiento: ['', Validators.required],
    localidad: ['', Validators.required],
    nomenclatura: ['', Validators.required],
    fechaEmision: [null as Date | null, Validators.required],
  });

  protected mensajeEnvio = '';

  protected get nombresArchivos(): Record<TipoDocumento, string> {
    const documentos = this.solicitudActual().documentos;

    return {
      dni: documentos.find((documento) => documento.tipo === 'dni')?.nombreArchivo ?? '',
      formularioC01:
        documentos.find((documento) => documento.tipo === 'formularioC01')?.nombreArchivo ?? '',
      antecedentes:
        documentos.find((documento) => documento.tipo === 'antecedentes')?.nombreArchivo ?? '',
      comprobantePago:
        documentos.find((documento) => documento.tipo === 'comprobantePago')?.nombreArchivo ?? '',
    };
  }

  protected get estadosDocumentos(): Record<TipoDocumento, EstadoDocumento> {
    const documentos = this.solicitudActual().documentos;

    return {
      dni: documentos.find((documento) => documento.tipo === 'dni')!.estado,
      formularioC01: documentos.find((documento) => documento.tipo === 'formularioC01')!.estado,
      antecedentes: documentos.find((documento) => documento.tipo === 'antecedentes')!.estado,
      comprobantePago: documentos.find((documento) => documento.tipo === 'comprobantePago')!.estado,
    };
  }

  protected get estadoSolicitud(): EstadoSolicitud {
    return this.solicitudActual().estado;
  }

  protected get observacionesDocumentos(): Record<TipoDocumento, string> {
    const documentos = this.solicitudActual().documentos;

    return {
      dni: documentos.find((documento) => documento.tipo === 'dni')?.observacion ?? '',
      formularioC01:
        documentos.find((documento) => documento.tipo === 'formularioC01')?.observacion ?? '',
      antecedentes:
        documentos.find((documento) => documento.tipo === 'antecedentes')?.observacion ?? '',
      comprobantePago:
        documentos.find((documento) => documento.tipo === 'comprobantePago')?.observacion ?? '',
    };
  }

  constructor() {
    this.cargarBorrador();
  }

  protected get puedeEnviarRevision(): boolean {
    const estadoPermiteEnvio =
      this.estadoSolicitud === 'presentada' || this.estadoSolicitud === 'observada';

    return (
      estadoPermiteEnvio &&
      this.formulario.valid &&
      this.nombresArchivos.dni !== '' &&
      this.nombresArchivos.formularioC01 !== '' &&
      this.nombresArchivos.antecedentes !== ''
    );
  }

  protected actualizarNombreArchivo(tipo: TipoDocumento, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (archivo) {
      this.store.dispatch(
        archivoSeleccionado({
          tipo,
          nombreArchivo: archivo.name,
        }),
      );
    }
  }

  protected etiquetaEstado(estado: EstadoDocumento): string {
    const etiquetas: Record<EstadoDocumento, string> = {
      pendienteCarga: 'Pendiente de carga',
      pendienteRevision: 'Pendiente de revisión',
      aprobado: 'Aprobado',
      observado: 'Observado',
      rechazado: 'Rechazado',
    };

    return etiquetas[estado];
  }

  protected guardarBorrador(): void {
    const borrador = {
      formulario: this.formulario.getRawValue(),
      nombresArchivos: this.nombresArchivos,
      guardadoEn: new Date().toISOString(),
    };

    try {
      localStorage.setItem('fauna-borrador-mis-documentos', JSON.stringify(borrador));

      this.mensajeEnvio =
        'Borrador guardado en este navegador. Los archivos deberán seleccionarse nuevamente.';
    } catch {
      this.mensajeEnvio = 'No se pudo guardar el borrador en este navegador.';
    }
  }

  private cargarBorrador(): void {
    try {
      const contenidoGuardado = localStorage.getItem('fauna-borrador-mis-documentos');

      if (!contenidoGuardado) {
        return;
      }

      const borrador = JSON.parse(contenidoGuardado) as {
        formulario?: {
          numeroDni?: string;
          establecimiento?: string;
          localidad?: string;
          nomenclatura?: string;
          fechaEmision?: string | null;
        };
      };

      const fechaGuardada = borrador.formulario?.fechaEmision;
      const fechaEmision = fechaGuardada ? new Date(fechaGuardada) : null;

      this.formulario.patchValue({
        numeroDni: borrador.formulario?.numeroDni ?? '',
        establecimiento: borrador.formulario?.establecimiento ?? '',
        localidad: borrador.formulario?.localidad ?? '',
        nomenclatura: borrador.formulario?.nomenclatura ?? '',
        fechaEmision: fechaEmision && !Number.isNaN(fechaEmision.getTime()) ? fechaEmision : null,
      });

      this.mensajeEnvio =
        'Se recuperaron los datos del borrador. Por seguridad, volvé a seleccionar los archivos.';
    } catch {
      this.mensajeEnvio = 'No se pudo recuperar el borrador guardado en este navegador.';
    }
  }

  protected enviarARevision(): void {
    if (!this.puedeEnviarRevision) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.store.dispatch(estadoSolicitudActualizado({ estado: 'completa' }));
    this.store.dispatch(estadoSolicitudActualizado({ estado: 'enRevision' }));

    const nombresArchivos = this.nombresArchivos;
    const tiposDocumento = Object.keys(nombresArchivos) as TipoDocumento[];

    for (const tipo of tiposDocumento) {
      if (nombresArchivos[tipo] !== '') {
        this.store.dispatch(
          estadoDocumentoActualizado({
            tipo,
            estado: 'pendienteRevision',
          }),
        );
      }
    }

    this.mensajeEnvio =
      'Envío de demostración realizado. La solicitud quedó en revisión; los archivos no se enviaron a un servidor.';
  }
}
