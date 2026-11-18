import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import type {
  EstadoDocumento,
  EstadoSolicitud,
  TipoDocumento,
} from '../../models/estados-tramites';
import {
  puedeCambiarEstadoDocumento,
  puedeCambiarEstadoSolicitud,
} from '../../models/maquina-estados';

@Component({
  selector: 'app-mis-documentos',
  imports: [RouterLink, DatePickerModule, ReactiveFormsModule],
  templateUrl: './mis-documentos.html',
  styleUrl: './mis-documentos.scss',
})
export class MisDocumentos {
  private readonly fb = inject(FormBuilder);

  protected readonly fechaMaxima = new Date();

  protected readonly formulario = this.fb.group({
    numeroDni: ['', Validators.required],
    establecimiento: ['', Validators.required],
    localidad: ['', Validators.required],
    nomenclatura: ['', Validators.required],
    fechaEmision: [null as Date | null, Validators.required],
  });

  protected nombresArchivos: Record<TipoDocumento, string> = {
    dni: '',
    formularioC01: '',
    antecedentes: '',
    comprobantePago: '',
  };

  protected estadosDocumentos: Record<TipoDocumento, EstadoDocumento> = {
    dni: 'pendienteCarga',
    formularioC01: 'pendienteCarga',
    antecedentes: 'pendienteCarga',
    comprobantePago: 'pendienteCarga',
  };

  protected estadoSolicitud: EstadoSolicitud = 'presentada';
  protected mensajeEnvio = '';

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
      this.nombresArchivos[tipo] = archivo.name;
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

    if (this.estadoSolicitud !== 'completa') {
      if (!puedeCambiarEstadoSolicitud(this.estadoSolicitud, 'completa')) {
        return;
      }

      this.estadoSolicitud = 'completa';
    }

    if (!puedeCambiarEstadoSolicitud(this.estadoSolicitud, 'enRevision')) {
      return;
    }

    this.estadoSolicitud = 'enRevision';

    const tiposDocumento = Object.keys(this.nombresArchivos) as TipoDocumento[];

    for (const tipo of tiposDocumento) {
      const tieneArchivo = this.nombresArchivos[tipo] !== '';
      const puedePasarARevision = puedeCambiarEstadoDocumento(
        this.estadosDocumentos[tipo],
        'pendienteRevision',
      );

      if (tieneArchivo && puedePasarARevision) {
        this.estadosDocumentos[tipo] = 'pendienteRevision';
      }
    }

    this.mensajeEnvio =
      'Envío de demostración realizado. La solicitud quedó en revisión; los archivos no se enviaron a un servidor.';
  }
}
