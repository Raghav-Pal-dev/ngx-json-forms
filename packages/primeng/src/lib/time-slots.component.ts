/**
 * Appointment-style time-slot picker. Renders a wrap-flex grid of
 * clickable slot buttons; selected ones get the primary fill.
 *
 * Value:
 *   - `multiple: false` (default): `string | null`
 *   - `multiple: true`:           `string[]`
 *
 * Slots are provided by the parent as either a flat `string[]`
 * (`['09:00', '09:30', ...]`) or a richer `Slot[]` shape (`[{ value,
 *  label?, disabled? }]`) — letting servers mark e.g. already-booked
 * slots as disabled without removing them.
 *
 * Implements `ControlValueAccessor` so it slots into any reactive
 * form (and the JSON-driven engine) without adapter glue.
 *
 * @since 1.14.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

export interface Slot {
  value: string;
  label?: string;
  disabled?: boolean;
}

@Component({
  selector: 'ngx-time-slots',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSlotsComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: block; }
      .ngx-slot-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .ngx-slot-empty {
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
        padding: 0.5rem 0;
      }
    `,
  ],
  template: `
    @if (!normalised().length) {
      <div class="ngx-slot-empty">{{ emptyMessage() }}</div>
    } @else {
      <div class="ngx-slot-grid">
        @for (slot of normalised(); track slot.value) {
          <p-button
            type="button"
            size="small"
            [label]="slot.label ?? slot.value"
            [severity]="$any(severityFor(slot.value))"
            [outlined]="!isSelected(slot.value)"
            [disabled]="!!slot.disabled || disabled()"
            (onClick)="toggle(slot.value)"
          ></p-button>
        }
      </div>
    }
  `,
})
export class TimeSlotsComponent implements ControlValueAccessor {
  /** Available slots. Pass `string[]` for simple, or `Slot[]` for richer. */
  readonly slots = input<(string | Slot)[]>([]);
  /** Allow picking multiple slots. Defaults to false. */
  readonly multiple = input<boolean>(false);
  /** Severity for the *selected* button. Defaults to `'primary'`. */
  readonly selectedSeverity = input<string>('primary');
  /** Severity for unselected buttons (`outlined` removes the fill). */
  readonly unselectedSeverity = input<string>('secondary');
  /** Message when `slots` is empty. */
  readonly emptyMessage = input<string>('No slots available');

  readonly disabled = signal(false);
  private readonly value = signal<string | string[] | null>(null);

  /** Always coerce `slots` input to `Slot[]` so the template stays uniform. */
  protected readonly normalised = computed<Slot[]>(() =>
    this.slots().map((s) =>
      typeof s === 'string' ? { value: s, label: s } : s
    )
  );

  private onChange: (v: string | string[] | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ── ControlValueAccessor ──

  writeValue(value: string | string[] | null): void {
    this.value.set(value);
  }
  registerOnChange(fn: (v: string | string[] | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ── UI helpers ──

  protected isSelected(slotValue: string): boolean {
    const v = this.value();
    return this.multiple()
      ? Array.isArray(v) && v.includes(slotValue)
      : v === slotValue;
  }

  protected severityFor(slotValue: string): string {
    return this.isSelected(slotValue)
      ? this.selectedSeverity()
      : this.unselectedSeverity();
  }

  protected toggle(slotValue: string): void {
    if (this.disabled()) return;
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as string[])] : [];
      const idx = current.indexOf(slotValue);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(slotValue);
      this.value.set(current);
      this.onChange(current);
    } else {
      // Click-again-to-deselect in single mode (else click another).
      const next = this.value() === slotValue ? null : slotValue;
      this.value.set(next);
      this.onChange(next);
    }
    this.onTouched();
  }
}
