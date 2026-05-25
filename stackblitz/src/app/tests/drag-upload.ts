import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-drag-upload',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Drag & drop upload (1.12.0)</h1>
      <p class="muted">
        Drop a file (or several) onto any zone below. PrimeNG's
        advanced fileupload mode gives you the dropzone, per-file
        queue, remove buttons, and Upload / Cancel buttons —
        <code>presets.dragUpload()</code> just configures it.
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (uploadedNames().length) {
        <h2>Last picked files</h2>
        <ul>
          @for (n of uploadedNames(); track n) { <li>{{ n }}</li> }
        </ul>
      }
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ summary(e) | json }}</pre>
      }
    </div>
  `,
})
export class DragUploadComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'title', label: 'Attachment title', required: true }),

    // Default: multi-file, any type, up to 5 MB each.
    presets.dragUpload({
      formControlName: 'attachments',
      label: 'Attachments (any file type)',
    }),

    // Single-image avatar with 2 MB cap + auto-upload.
    presets.dragUpload({
      formControlName: 'avatar',
      label: 'Avatar (JPG/PNG, max 2 MB, auto-upload)',
      accept: 'image/*',
      multiple: false,
      maxFileSize: 2 * 1024 * 1024,
      auto: true,
    }),

    // PDF-only docs with French labels.
    presets.dragUpload({
      formControlName: 'docs',
      label: 'Documents (PDF only)',
      accept: '.pdf',
      fileLimit: 5,
      chooseLabel: 'Sélectionner',
      uploadLabel: 'Téléverser',
      cancelLabel: 'Annuler',
      dragDropLabel: 'Glissez-déposez vos fichiers ici',
    }),

    presets.submit({ label: 'Submit' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected readonly uploadedNames = signal<string[]>([]);

  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void {
    this.last.set(e);
    if (e.type === 'uploadHandler' || e.type === 'select') {
      const raw = e.originalEvent as { files?: File[] } | undefined;
      if (raw?.files) this.uploadedNames.set(raw.files.map((f) => `${f.name} (${f.size} bytes)`));
    }
  }

  /** Strip the raw event (it has File objects that don't JSON-stringify nicely). */
  protected summary(e: FormEngineEvent) {
    const { originalEvent: _o, ...rest } = e;
    return { ...rest, eventHasFiles: !!(e.originalEvent as { files?: File[] })?.files };
  }
}
