import { Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-signature',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Signature field (1.10.0)</h1>
      <p class="muted">
        Sign with mouse, finger, or stylus. The bound value is a
        <code>data:image/png;base64,...</code> URL — drop it into an
        <code>&lt;img&gt;</code> to render, send as-is to your
        backend, or store in JSON. Click <b>Clear</b> to reset to
        <code>null</code>.
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (lastSignature(); as sig) {
        <h2>Captured signature preview</h2>
        <img [src]="sig" alt="signature preview"
             style="max-width: 100%; border: 1px solid #eee; padding: 0.5rem; background: #fff;" />
      }
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ truncated(e.values) | json }}</pre>
        <p class="muted"><em>(Data URLs truncated above for readability.)</em></p>
      }
    </div>
  `,
})
export class SignatureComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'fullName', label: 'Full name', required: true }),
    presets.signature({
      formControlName: 'consent',
      label: 'I agree (sign below)',
      required: true,
    }),
    // Customised pen color + height for a "manager approval" style.
    presets.signature({
      formControlName: 'approval',
      label: 'Manager approval',
      penColor: '#1d4ed8',
      penWidth: 3,
      height: 220,
    }),
    presets.submit({ label: 'Submit' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected readonly lastSignature = computed(
    () => (this.last()?.values?.['consent'] as string | null) ?? null
  );

  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }

  /** Trim data-URL strings in the displayed JSON so the page doesn't explode. */
  protected truncated(values: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      out[k] = typeof v === 'string' && v.startsWith('data:')
        ? `${v.slice(0, 64)}… (${v.length} chars)`
        : v;
    }
    return out;
  }
}
