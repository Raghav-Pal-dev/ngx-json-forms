import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

const sampleJson = JSON.stringify(
  {
    name: 'ngx-json-forms',
    versions: ['1.6.0', '1.7.0', '1.8.0'],
    features: { schemaInterop: true, signatures: true, captcha: true },
  },
  null,
  2,
);

const sampleHtml = `<!doctype html>
<html>
  <head>
    <title>Welcome, {{name}}</title>
  </head>
  <body>
    <h1>Hello, {{name}}!</h1>
    <p>Thanks for signing up.</p>
  </body>
</html>`;

@Component({
  selector: 'playground-code',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Code editor field (1.19.0)</h1>
      <p class="muted">
        CodeMirror 6 with syntax highlighting. Switches between
        languages via the <code>language</code> prop. Each language
        is a separate CodeMirror peer dep, dynamic-imported on demand
        — so the bundle only carries the languages you actually use.
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ truncated(e.values) | json }}</pre>
      }
    </div>
  `,
})
export class CodeComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'name', label: 'Config name', required: true }),

    presets.code({
      formControlName: 'json',
      label: 'JSON config',
      language: 'json',
      height: '14rem',
      required: true,
    }),

    presets.code({
      formControlName: 'html',
      label: 'Email template (HTML)',
      language: 'html',
      height: '16rem',
    }),

    presets.code({
      formControlName: 'notes',
      label: 'Plain notes (no syntax)',
      language: 'text',
      height: '8rem',
    }),

    presets.submit({ label: 'Save config' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);

  // Pre-fill on init via writeValue equivalent — just hand-set the controls.
  constructor() {
    setTimeout(() => {
      this.fields.update((fs) => fs); // tickle
    });
  }

  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }

  /** Code bodies are big — trim displayed JSON. */
  protected truncated(values: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      out[k] = typeof v === 'string' && v.length > 120
        ? `${v.slice(0, 120)}… (${v.length} chars)`
        : v;
    }
    return out;
  }

  // exported so the template type-checks (unused in this trivial demo)
  protected readonly _samples = { sampleJson, sampleHtml };
}
