import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormSchema, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-date-range',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Date range field (1.9.0)</h1>
      <p class="muted">
        Pick a start date, then an end date — the picker stays open
        until both are chosen. Bound value is
        <code>[Date, Date | null]</code>; the second entry is
        <code>null</code> mid-selection. The
        <code>presets.endAfterStart()</code> cross-field validator
        blocks "same day" or "end before start" combos.
      </p>
      <ngx-json-form
        [schema]="schema"
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
export class DateRangeComponent {
  // Schema (not flat fields) — so we can attach the cross-field validator.
  protected readonly schema: FormSchema = {
    fields: [
      presets.dateRange({
        formControlName: 'stay',
        label: 'Hotel stay',
        minToday: true,
        required: true,
      }),
      presets.dateRange({
        formControlName: 'reporting',
        label: 'Reporting period (ISO format)',
        dateFormat: 'yy-mm-dd',
        numberOfMonths: 2,
      }),
      presets.submit({ label: 'Book' }),
    ],
    crossFieldValidators: [
      presets.endAfterStart({ formControlName: 'stay' }),
      presets.endAfterStart({ formControlName: 'reporting', strict: false }),
    ],
  };

  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
