import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-currency',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Currency field (1.7.0)</h1>
      <p class="muted">
        PrimeNG <code>&lt;p-inputnumber mode="currency"&gt;</code> with
        locale-aware grouping + symbol. Try changing
        <code>currency: 'USD'</code> to <code>'EUR'</code>,
        <code>'INR'</code>, <code>'JPY'</code>, or
        <code>locale: 'en-US'</code> to <code>'de-DE'</code>,
        <code>'ja-JP'</code>, <code>'en-IN'</code>.
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
export class CurrencyComponent {
  protected readonly fields = signal<FormField[]>([
    // USD — defaults: en-US, $ symbol, 2 fraction digits.
    presets.currency({
      formControlName: 'priceUsd',
      label: 'Price (USD)',
    }),
    // EUR with German locale — comma as decimal, dot as thousands.
    presets.currency({
      formControlName: 'priceEur',
      label: 'Price (EUR, de-DE)',
      currency: 'EUR',
      locale: 'de-DE',
    }),
    // INR with Indian grouping (1,00,000 not 100,000).
    presets.currency({
      formControlName: 'priceInr',
      label: 'Price (INR)',
      currency: 'INR',
      locale: 'en-IN',
    }),
    // JPY — zero-decimal currency, capped at ¥1,000,000.
    presets.currency({
      formControlName: 'priceJpy',
      label: 'Price (JPY, no decimals, max 1,000,000)',
      currency: 'JPY',
      locale: 'ja-JP',
      minFractionDigits: 0,
      maxFractionDigits: 0,
      max: 1_000_000,
    }),
    // With +/- spinner buttons.
    presets.currency({
      formControlName: 'donation',
      label: 'Donation (with buttons)',
      currency: 'USD',
      showButtons: true,
      max: 500,
    }),
    presets.submit({ label: 'Submit' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
