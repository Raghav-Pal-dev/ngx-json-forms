/**
 * International phone input — country flag dropdown + format-as-you-
 * type number input. The form value is a canonical **E.164** string
 * (e.g. `+14155551234`) or `null` when empty. That's what backends
 * almost always want; consumers needing the rich parse output can
 * `parsePhoneNumber(value)` from `libphonenumber-js` themselves.
 *
 * `libphonenumber-js@^1.11` is an **optional** peer dep of
 * `@ngx-json-forms/primeng`. The component dynamic-imports it on
 * first init so consumers who never use this field pay zero load
 * cost (the library is ~145 KB minified — biggest single import in
 * the formats catalogue). Without it the field falls back to a
 * plain text input + the basic E.164 pattern hint.
 *
 * Implements `ControlValueAccessor`. Country is internal state only;
 * the bound form value is just the formatted E.164 string.
 *
 * @since 1.18.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

/** Subset of libphonenumber-js we touch. */
interface PhoneLib {
  getCountries(): readonly string[];
  getCountryCallingCode(country: string): string;
  parsePhoneNumberFromString(
    input: string,
    country?: string
  ): { country?: string; number?: string; isValid(): boolean; nationalNumber: string } | undefined;
  isValidPhoneNumber(input: string, country?: string): boolean;
  AsYouType: new (country?: string) => {
    input(c: string): string;
    getNumberValue(): string | undefined;
    getCountry(): string | undefined;
  };
}

/**
 * Display labels for the ISO 3166-1 alpha-2 codes libphonenumber
 * returns. Falls back to the code itself for anything not in this
 * curated set (rare countries still work — they just show as the
 * ISO code).
 */
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', CA: 'Canada', GB: 'United Kingdom', AU: 'Australia',
  NZ: 'New Zealand', IN: 'India', DE: 'Germany', FR: 'France',
  ES: 'Spain', IT: 'Italy', JP: 'Japan', CN: 'China',
  BR: 'Brazil', MX: 'Mexico', SG: 'Singapore', AE: 'United Arab Emirates',
  SA: 'Saudi Arabia', PK: 'Pakistan', BD: 'Bangladesh', ID: 'Indonesia',
  TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines', MY: 'Malaysia',
  KR: 'South Korea', ZA: 'South Africa', NG: 'Nigeria', EG: 'Egypt',
  NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland',
  IE: 'Ireland', PT: 'Portugal', GR: 'Greece', TR: 'Turkey',
  IL: 'Israel', RU: 'Russia', UA: 'Ukraine', AR: 'Argentina',
  CL: 'Chile', CO: 'Colombia', PE: 'Peru',
};

interface CountryOption {
  value: string;      // ISO code, e.g. 'US'
  label: string;      // 'United States (+1)'
  callingCode: string; // '+1'
}

@Component({
  selector: 'ngx-phone-input',
  imports: [
    FormsModule,
    SelectModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: block; }
      .ngx-phone-row {
        display: flex;
        gap: 0.5rem;
      }
      .ngx-phone-country {
        flex: 0 0 12rem;
        min-width: 8rem;
      }
      .ngx-phone-number {
        flex: 1;
        min-width: 0;
      }
      .ngx-phone-number input {
        width: 100%;
      }
      .ngx-phone-warn {
        margin-top: 0.5rem;
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
      }
    `,
  ],
  template: `
    @if (libMissing()) {
      <input
        pInputText
        type="tel"
        [placeholder]="placeholder() || 'E.164 (+14155551234)'"
        [ngModel]="raw()"
        (ngModelChange)="onRawInput($event)"
        [disabled]="disabledSig()"
      />
      <p class="ngx-phone-warn">
        Install <code>libphonenumber-js</code> for formatted input + validation:<br />
        <code>npm install libphonenumber-js</code>
      </p>
    } @else {
      <div class="ngx-phone-row">
        <p-select
          class="ngx-phone-country"
          [options]="countryOptions()"
          [(ngModel)]="country"
          optionLabel="label"
          optionValue="value"
          [filter]="true"
          filterBy="label"
          [disabled]="disabledSig()"
          appendTo="body"
        ></p-select>
        <input
          class="ngx-phone-number"
          pInputText
          type="tel"
          [placeholder]="placeholder() || 'Phone number'"
          [ngModel]="national()"
          (ngModelChange)="onNumberInput($event)"
          (blur)="onBlur()"
          [disabled]="disabledSig()"
        />
      </div>
    }
  `,
})
export class PhoneInputComponent implements ControlValueAccessor {
  /** Default country (ISO 3166-1 alpha-2) shown when the user hasn't picked one. */
  readonly defaultCountry = input<string>('US');
  /** Placeholder text for the number input. */
  readonly placeholder = input<string>('');

  protected readonly libMissing = signal(false);
  protected readonly disabledSig = signal(false);

  /** Selected country (ISO 3166-1 alpha-2). */
  protected country = 'US';
  /** What the user has typed for the national portion. Display-formatted. */
  protected readonly national = signal<string>('');
  /** Raw fallback for when the lib is missing. */
  protected readonly raw = signal<string>('');

  /** Loaded lib (set after dynamic import resolves). */
  private lib: PhoneLib | null = null;

  protected readonly countryOptions = signal<CountryOption[]>([]);

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    this.country = this.defaultCountry();
    void this.loadLib();

    // When the user (or initial writeValue) changes country, re-format
    // the national digits we have under the new country's rules.
    effect(() => {
      const lib = this.lib;
      if (!lib) return;
      const c = this.country;
      const n = this.national();
      if (!n) {
        this.emit(null);
        return;
      }
      this.emit(this.format(c, n));
    });
  }

  private async loadLib(): Promise<void> {
    try {
      this.lib = (await import('libphonenumber-js')) as unknown as PhoneLib;
      this.countryOptions.set(this.buildCountryOptions(this.lib));
    } catch {
      this.libMissing.set(true);
    }
  }

  private buildCountryOptions(lib: PhoneLib): CountryOption[] {
    return lib
      .getCountries()
      .map((iso) => {
        const callingCode = '+' + lib.getCountryCallingCode(iso);
        const name = COUNTRY_NAMES[iso] ?? iso;
        return {
          value: iso,
          label: `${name} (${callingCode})`,
          callingCode,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  // ── ControlValueAccessor ──

  writeValue(value: string | null): void {
    if (!value) {
      this.national.set('');
      this.raw.set('');
      return;
    }
    if (!this.lib) {
      // Defer until lib resolves; for now hold the raw E.164 in the fallback input.
      this.raw.set(value);
      queueMicrotask(() => this.lib && this.writeValue(value));
      return;
    }
    const parsed = this.lib.parsePhoneNumberFromString(value);
    if (parsed) {
      if (parsed.country) this.country = parsed.country;
      // Pretty-format the national portion via AsYouType for display.
      const formatter = new this.lib.AsYouType(parsed.country);
      this.national.set(formatter.input(parsed.nationalNumber));
    } else {
      this.raw.set(value);
    }
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabledSig.set(isDisabled);
  }

  // ── User input ──

  protected onNumberInput(typed: string): void {
    if (!this.lib) return;
    const formatter = new this.lib.AsYouType(this.country);
    const formatted = formatter.input(typed ?? '');
    this.national.set(formatted);
    // If the formatter sniffed out a country from a paste (e.g. "+44..."),
    // switch to it so the dropdown stays in sync.
    const sniffed = formatter.getCountry();
    if (sniffed && sniffed !== this.country) {
      this.country = sniffed;
    }
    this.emit(this.format(this.country, formatted));
  }

  protected onRawInput(v: string): void {
    this.raw.set(v ?? '');
    this.emit(v?.trim() || null);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  // ── Helpers ──

  private format(country: string, national: string): string | null {
    if (!national || !this.lib) return null;
    const parsed = this.lib.parsePhoneNumberFromString(national, country);
    return parsed?.number ?? null;
  }

  private emit(v: string | null): void {
    this.onChange(v);
  }
}
