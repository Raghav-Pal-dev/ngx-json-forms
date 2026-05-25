import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-markdown',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Markdown field (1.15.0)</h1>
      <p class="muted">
        Textarea on the left, live HTML preview on the right.
        Backed by the <code>marked</code> peer dep — install it in
        your consumer app to enable previewing:
        <code>npm install marked</code>.
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
export class MarkdownComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'title', label: 'Post title', required: true }),

    // Default split layout.
    presets.markdown({
      formControlName: 'bio',
      label: 'Bio (split — type and preview)',
      rows: 6,
      minLength: 10,
      maxLength: 1000,
      required: true,
    }),

    // Editor-only layout (no preview pane).
    presets.markdown({
      formControlName: 'note',
      label: 'Private note (editor only, no preview)',
      layout: 'editor',
      rows: 4,
    }),

    presets.submit({ label: 'Publish' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
