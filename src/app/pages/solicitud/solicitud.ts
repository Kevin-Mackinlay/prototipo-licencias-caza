import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-solicitud',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './solicitud.html',
  styleUrl: './solicitud.scss',
})
export class Solicitud {
  // Campos de demostración; confirmar con el formulario oficial.
  readonly formulario = new FormGroup({
    nombreCompleto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    dni: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  enviado = false;

  continuar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      this.enviado = false;
      return;
    }

    this.enviado = true;
  }
}
