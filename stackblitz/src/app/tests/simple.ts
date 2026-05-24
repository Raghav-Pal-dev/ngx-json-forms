import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-simple',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Simple form (uses 1.1.0 presets)</h1>
      <p class="muted">
        Try changing <code>required</code> to <code>false</code>, or
        replace <code>presets.email</code> with <code>presets.text</code>
        — re-renders instantly.
      </p>
      <ngx-json-form [fieldsInput]="fields()" (formSubmit)="onSubmit($event)" (formChange)="onChange($event)" />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class SimpleComponent {
  protected readonly fields = signal<FormField[]>([
    { ...presets.text({  formControlName: 'firstName', label: 'First name', required: true, minLength: 2 }), layout: { columnSpan: 6 } },
    { ...presets.text({  formControlName: 'lastName',  label: 'Last name',  required: true               }), layout: { columnSpan: 6 } },
    presets.email({ formControlName: 'email', label: 'Email' }),
    presets.submit({ label: 'Submit' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
