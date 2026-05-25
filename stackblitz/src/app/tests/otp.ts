import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-otp',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>OTP field (1.6.0)</h1>
      <p class="muted">
        Drop-in <code>&lt;p-inputotp&gt;</code> renderer. Tweak
        <code>length</code> / <code>mask</code> / <code>integerOnly</code>
        in <code>presets.otp(...)</code> below.
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
export class OtpComponent {
  protected readonly fields = signal<FormField[]>([
    presets.email({ formControlName: 'email', label: 'Email' }),
    // 6-digit numeric verification code — the default.
    presets.otp({ formControlName: 'code', label: 'Verification code' }),
    // 4-digit masked PIN — change `mask: false` and watch the digits appear.
    presets.otp({ formControlName: 'pin', label: 'PIN', length: 4, mask: true }),
    // 8-character alphanumeric backup code.
    presets.otp({
      formControlName: 'backup',
      label: 'Backup code (letters allowed)',
      length: 8,
      integerOnly: false,
    }),
    presets.submit({ label: 'Verify' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
