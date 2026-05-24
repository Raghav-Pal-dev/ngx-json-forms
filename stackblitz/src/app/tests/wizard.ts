import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormStepperComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormSchema } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-wizard',
  imports: [NgxJsonFormStepperComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Wizard / Stepper</h1>
      <p class="muted">3 steps. Try adding a 4th step or marking step-2 <code>skipValidation: true</code>.</p>
      <ngx-json-form-stepper [schema]="schema" submitLabel="Create account" (formSubmit)="onSubmit($event)" />
      @if (submitted(); as e) {
        <h2>Submitted</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class WizardComponent {
  protected readonly schema: FormSchema = {
    steps: [
      {
        id: 'basics',
        title: 'Basics',
        fields: [
          { formControlName: 'firstName', label: 'First name', config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
          { formControlName: 'lastName',  label: 'Last name',  config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
        ],
      },
      {
        id: 'contact',
        title: 'Contact',
        fields: [
          { formControlName: 'email', label: 'Email', config: { attributes: { inputType: 'text', type: 'email', acceptedEvents: ['change', 'blur'] } }, validations: { rules: { required: true, email: true } }, layout: { columnSpan: 12 } },
        ],
      },
      {
        id: 'review',
        title: 'Review',
        skipValidation: true,
        fields: [
          { formControlName: 'note', label: 'Anything else?', config: { attributes: { inputType: 'textarea', rows: 4 } }, layout: { columnSpan: 12 } },
        ],
      },
    ],
  };
  protected readonly submitted = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.submitted.set(e); }
}
