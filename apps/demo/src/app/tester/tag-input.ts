import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-tag-input',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>tagInput field (1.8.0)</h1>
      <p class="muted">
        Type a word and press <kbd>Enter</kbd> (or the configured
        separator). Click the X on a chip to remove it. The form value
        is a plain <code>string[]</code> — no
        <code>{{ '{' }}label,value{{ '}' }}</code> wrapping.
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
export class TagInputComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'postTitle', label: 'Post title', required: true }),

    // Free tags, no separator (Enter / Tab only).
    presets.tagInput({
      formControlName: 'tags',
      label: 'Tags',
      placeholder: 'angular, forms, json…',
    }),

    // Comma-separated invitee list, capped at 10, at least one required.
    presets.tagInput({
      formControlName: 'invitees',
      label: 'Invite team members (max 10)',
      placeholder: 'jane@acme.com, john@acme.com',
      separator: ',',
      required: true,
      minTags: 1,
      maxTags: 10,
    }),

    // Allow duplicates (e.g. logging the same word multiple times).
    presets.tagInput({
      formControlName: 'keywords',
      label: 'Keywords (duplicates allowed)',
      unique: false,
    }),

    presets.submit({ label: 'Publish' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
