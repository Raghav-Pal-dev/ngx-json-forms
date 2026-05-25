import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

/** Build today's 9 AM → 5 PM slots in half-hour increments. */
function todaySlots(): string[] {
  const out: string[] = [];
  for (let h = 9; h < 17; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
}

@Component({
  selector: 'playground-time-slots',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>timeSlots field (1.14.0)</h1>
      <p class="muted">
        Server-driven button grid for appointment booking, course
        scheduling, etc. Single-pick by default; <code>multiple:
        true</code> lets the user pick several. Already-booked slots
        can be marked <code>disabled</code> without removing them
        from the grid.
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
export class TimeSlotsComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'name', label: 'Your name', required: true }),

    // Single-pick — value is `string | null`.
    presets.timeSlots({
      formControlName: 'appointment',
      label: 'Pick a time today',
      slots: todaySlots(),
      required: true,
    }),

    // Multi-pick with two slots already booked + custom severities.
    presets.timeSlots({
      formControlName: 'workshops',
      label: 'Workshops to attend (pick any)',
      multiple: true,
      selectedSeverity: 'success',
      slots: [
        { value: 'mon-9',  label: 'Mon 9 AM' },
        { value: 'mon-2',  label: 'Mon 2 PM', disabled: true },
        { value: 'tue-9',  label: 'Tue 9 AM' },
        { value: 'tue-2',  label: 'Tue 2 PM' },
        { value: 'wed-9',  label: 'Wed 9 AM', disabled: true },
        { value: 'wed-2',  label: 'Wed 2 PM' },
      ],
    }),

    presets.submit({ label: 'Book' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
