import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-address',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Address composite (1.11.0)</h1>
      <p class="muted">
        <code>presets.address()</code> scaffolds a nested
        <code>group</code> with six sub-fields (line1, line2, city,
        state, postalCode, country). Use <code>include</code> to drop
        sub-fields, <code>required</code> for per-field tweaks,
        <code>countries</code> for a custom dropdown (or pass
        <code>[]</code> for a free-form text input). The form value
        is a nested object keyed by the address control name.
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
export class AddressComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'fullName', label: 'Full name', required: true }),

    // Default address — all 6 sub-fields, common country list.
    presets.address({ formControlName: 'shipping', label: 'Shipping address' }),

    // Billing — skip line2 + state, restrict to India only.
    presets.address({
      formControlName: 'billing',
      label: 'Billing address (India only)',
      include: { line2: false, state: false },
      countries: [{ label: 'India', value: 'IN' }],
    }),

    // Free-form address — pass countries=[] so country becomes a text input.
    presets.address({
      formControlName: 'other',
      label: 'Other (free-form country)',
      countries: [],
      required: { postalCode: false },
    }),

    presets.submit({ label: 'Save addresses' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
