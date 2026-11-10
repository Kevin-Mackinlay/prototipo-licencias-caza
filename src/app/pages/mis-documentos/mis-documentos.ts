import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';


type TipoDocumento = 'dni' | 'formularioC01' | 'antecedentes' | 'comprobantePago';

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

  protected actualizarNombreArchivo(tipo: TipoDocumento, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (archivo) {
      this.nombresArchivos[tipo] = archivo.name;
    }
  }
}
