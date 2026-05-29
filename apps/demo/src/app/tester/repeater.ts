import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-repeater',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Repeater (FormArray)</h1>
      <p class="muted">Bound between 1 and 3 rows. Try changing <code>maxRows</code>.</p>
      <ngx-json-form [fieldsInput]="fields()" (formSubmit)="onSubmit($event)" (formChange)="onChange($event)" />
      @if (last(); as e) {
        <h2>{{ e.type }}</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class RepeaterComponent {
  protected readonly fields = signal<FormField[]>([
    {
      formControlName: 'phones',
      label: 'Phone numbers',
      config: {
        attributes: {
          inputType: 'repeater',
          minRows: 1,
          maxRows: 3,
          addLabel: 'Add phone',
          itemFields: [
            {
              formControlName: 'kind',
              label: 'Kind',
              config: { attributes: { inputType: 'select', options: [{ label: 'Home', value: 'home' }, { label: 'Work', value: 'work' }, { label: 'Mobile', value: 'mobile' }], optionLabel: 'label', optionValue: 'value', acceptedEvents: ['change'] } },
              validations: { rules: { required: true } },
              layout: { columnSpan: 4 },
            },
            {
              formControlName: 'number',
              label: 'Number',
              config: { attributes: { inputType: 'text', type: 'tel', keyfilter: 'int', acceptedEvents: ['change', 'blur'] } },
              validations: { rules: { required: true, pattern: '^[0-9]{7,}$' }, messages: { pattern: 'At least 7 digits' } },
              layout: { columnSpan: 8 },
            },
          ],
          value: [{ kind: 'home', number: '' }],
        },
      },
      layout: { columnSpan: 12 },
    },
    {
      formControlName: 'submit',
      btnLabel: 'Save',
      config: { attributes: { inputType: 'button', buttonRole: 'submit' } },
      layout: { columnSpan: 4 },
    },
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
