import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AsyncValidatorFn } from '@angular/forms';
import { of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField } from '@ngx-json-forms/core';

// Simulated "username already taken" backend call (400 ms).
const usernameTaken: AsyncValidatorFn = (ctrl) =>
  timer(400).pipe(
    switchMap(() => {
      const taken = ['admin', 'root', 'raghav'];
      return of(taken.includes(String(ctrl.value ?? '').toLowerCase()) ? { usernameTaken: true } : null);
    }),
  );

@Component({
  selector: 'playground-custom-validator',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Inline async validator (1.1.0+)</h1>
      <p class="muted">
        Try "admin", "root", or "raghav" — the simulated backend rejects them after
        400 ms. The validator is passed directly in <code>asyncValidators</code>,
        no registry call needed.
      </p>
      <ngx-json-form [fieldsInput]="fields()" (formSubmit)="onSubmit($event)" (formChange)="onChange($event)" />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class CustomValidatorComponent {
  protected readonly fields = signal<FormField[]>([
    {
      formControlName: 'username',
      label: 'Username',
      placeholder: 'pick anything except "admin"',
      config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
      validations: {
        rules: { required: true, minLength: 3 },
        asyncValidators: [usernameTaken],
        messages: {
          required: 'Username is required',
          minLength: 'At least 3 characters',
          usernameTaken: 'That username is already taken',
        },
      },
      layout: { columnSpan: 12 },
    },
    { formControlName: 'submit', btnLabel: 'Sign up', config: { attributes: { inputType: 'button', buttonRole: 'submit' } }, layout: { columnSpan: 4 } },
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
