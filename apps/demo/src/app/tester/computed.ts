import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-computed',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Computed + transient (inline fn — 1.1.0+)</h1>
      <p class="muted">
        <code>fullName</code> and <code>discountedTotal</code> are derived
        live from other fields and excluded from the submit payload
        (<code>transient: true</code>). No <code>ngOnInit</code> dance.
      </p>
      <ngx-json-form [fieldsInput]="fields()" (formSubmit)="onSubmit($event)" (formChange)="onChange($event)" />
      @if (last(); as e) {
        <h2>{{ e.type }}</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class ComputedComponent {
  protected readonly fields = signal<FormField[]>([
    { formControlName: 'firstName', label: 'First name', config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
    { formControlName: 'lastName',  label: 'Last name',  config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
    {
      formControlName: 'fullName',
      label: 'Full name (computed, transient)',
      transient: true,
      computed: {
        deps: ['firstName', 'lastName'],
        fn: (deps) => `${String(deps['firstName'] ?? '').trim()} ${String(deps['lastName'] ?? '').trim()}`.trim(),
      },
      config: { attributes: { inputType: 'text', readonly: true } },
      layout: { columnSpan: 12 },
    },
    { formControlName: 'amount',      label: 'Amount',       config: { attributes: { inputType: 'text', type: 'number', value: 100, acceptedEvents: ['change', 'blur'] } }, layout: { columnSpan: 6 } },
    { formControlName: 'discountPct', label: 'Discount (%)', config: { attributes: { inputType: 'text', type: 'number', value: 10,  acceptedEvents: ['change', 'blur'] } }, layout: { columnSpan: 6 } },
    {
      formControlName: 'discountedTotal',
      label: 'Discounted total (computed, transient)',
      transient: true,
      computed: {
        deps: ['amount', 'discountPct'],
        fn: (deps) => ((Number(deps['amount']) || 0) * (1 - (Number(deps['discountPct']) || 0) / 100)).toFixed(2),
      },
      config: { attributes: { inputType: 'text', readonly: true } },
      layout: { columnSpan: 12 },
    },
    { formControlName: 'submit', btnLabel: 'Submit', config: { attributes: { inputType: 'button', buttonRole: 'submit' } }, layout: { columnSpan: 4 } },
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
