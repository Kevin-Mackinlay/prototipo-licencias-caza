import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import type { EstadoDocumento,TipoDocumento } from '../../models/estados-tramites';

@Component({
  selector: 'app-mis-documentos',
  imports: [RouterLink, DatePickerModule],
  templateUrl: './mis-documentos.html',
  styleUrl: './mis-documentos.scss',
})
export class MisDocumentos {
  protected readonly fechaMaxima = new Date();

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
}
