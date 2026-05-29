import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-conditional',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Conditional fields (showWhen)</h1>
      <p class="muted">
        Toggle "Buying as a company?" — VAT and company name appear /
        disappear declaratively. Try adding more <code>showWhen</code>
        operators (<code>in</code>, <code>matches</code>, <code>gt</code>).
      </p>
      <ngx-json-form [fieldsInput]="fields()" (formSubmit)="onSubmit($event)" (formChange)="onChange($event)" />
      @if (last(); as e) {
        <h2>{{ e.type }}</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class ConditionalComponent {
  protected readonly fields = signal<FormField[]>([
    {
      formControlName: 'isCompany',
      label: 'Buying as a company?',
      config: { attributes: { inputType: 'toggle', value: false, cardLayout: true, cardIcon: 'pi pi-briefcase', info: 'Reveals VAT + company-name fields.', acceptedEvents: ['change'] } },
      layout: { columnSpan: 12 },
    },
    {
      formControlName: 'companyName',
      label: 'Company name',
      showWhen: { conditions: [{ field: 'isCompany', operator: 'truthy' }] },
      config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
      validations: { rules: { required: true, minLength: 2 } },
      layout: { columnSpan: 6 },
    },
    {
      formControlName: 'vatNumber',
      label: 'VAT Number',
      showWhen: { conditions: [{ field: 'isCompany', operator: 'eq', value: true }] },
      config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
      validations: { rules: { required: true, pattern: '^[A-Z]{2}[0-9A-Z]{8,12}$' }, messages: { pattern: '2 uppercase letters + 8-12 alphanumeric' } },
      layout: { columnSpan: 6 },
    },
    {
      formControlName: 'email',
      label: 'Email',
      config: { attributes: { inputType: 'text', type: 'email', acceptedEvents: ['change', 'blur'] } },
      validations: { rules: { required: true, email: true } },
      layout: { columnSpan: 12 },
    },
    {
      formControlName: 'submit',
      btnLabel: 'Continue',
      config: { attributes: { inputType: 'button', buttonRole: 'submit' } },
      layout: { columnSpan: 4 },
    },
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
