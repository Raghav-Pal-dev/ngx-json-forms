import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-phone-intl',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>International phone field (1.18.0)</h1>
      <p class="muted">
        Country flag dropdown + format-as-you-type number input.
        Form value is canonical <b>E.164</b>
        (e.g. <code>+14155551234</code>). Backed by
        <code>libphonenumber-js</code> as an optional peer dep:
        <code>npm install libphonenumber-js</code>.
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class PhoneIntlComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'name', label: 'Your name', required: true }),

    // Default US.
    presets.phoneIntl({
      formControlName: 'mobile',
      label: 'Mobile (default US)',
      required: true,
    }),

    // Default India for an Indian app.
    presets.phoneIntl({
      formControlName: 'whatsapp',
      label: 'WhatsApp (default IN)',
      defaultCountry: 'IN',
    }),

    presets.submit({ label: 'Save' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
