import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-image-crop',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Image crop field (1.17.0)</h1>
      <p class="muted">
        Pick an image, drag the crop box, click <b>Apply</b>. The
        form value becomes the cropped PNG data URL. Backed by
        <code>cropperjs</code> (optional peer dep — install in your
        consumer with <code>npm install cropperjs@^1.6</code>).
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
export class ImageCropComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'displayName', label: 'Display name', required: true }),

    // 1:1 avatar, 256×256 max output.
    presets.imageCrop({
      formControlName: 'avatar',
      label: 'Avatar (1:1, max 256px)',
      aspectRatio: 1,
      maxOutputWidth: 256,
      maxOutputHeight: 256,
      required: true,
    }),

    // 16:9 cover image, up to 1920×1080.
    presets.imageCrop({
      formControlName: 'cover',
      label: 'Cover image (16:9, max 1920×1080)',
      aspectRatio: 16 / 9,
      maxOutputWidth: 1920,
      maxOutputHeight: 1080,
    }),

    presets.submit({ label: 'Save profile' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }

  /** Trim data URLs in the displayed JSON so the page stays readable. */
  protected truncated(values: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      out[k] = typeof v === 'string' && v.startsWith('data:')
        ? `${v.slice(0, 48)}… (${v.length} chars)`
        : v;
    }
    return out;
  }
}
