# @ngx-json-forms/primeng

The PrimeNG renderer for [`@ngx-json-forms/core`](https://www.npmjs.com/package/@ngx-json-forms/core).
Drop in `<ngx-json-form>`, pass a `FormField[]`, and get a fully
validated, reactive, multi-field PrimeNG form — no template markup
needed.

**Live demo:** https://raghav-pal-dev.github.io/ngx-json-forms/  
**Try it live (StackBlitz):** [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/tests/simple.ts) — fork a ready-made Angular 21 starter with all 6 form scenarios, edit any field def, see the form re-render instantly.  
**Source:** https://github.com/Raghav-Pal-dev/ngx-json-forms

## Install

```bash
npm i @ngx-json-forms/core @ngx-json-forms/primeng \
      primeng @primeng/themes primeicons \
      @angular/animations quill
```

Peer dependencies: `@angular/core`, `@angular/common`, `@angular/forms`,
`@angular/animations`, `primeng`, `@ngx-json-forms/core`, `rxjs`,
`primeicons`, `quill` (only if you use the `editor` field type).

## Wire-up

In your `app.config.ts`:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

In your global styles (`styles.css`):

```css
@import 'primeicons/primeicons.css';
```

## Quick start

```ts
import { Component, signal } from '@angular/core';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField } from '@ngx-json-forms/core';

@Component({
  selector: 'app-profile',
  imports: [NgxJsonFormComponent],
  template: `
    <ngx-json-form
      [fieldsInput]="fields()"
      (formSubmit)="onSubmit($event)"
      (formChange)="onChange($event)" />
  `,
})
export class ProfileForm {
  fields = signal<FormField[]>([
    {
      formControlName: 'firstName',
      label: 'First Name',
      placeholder: 'e.g. John',
      config: {
        attributes: {
          inputType: 'text',
          fieldIcon: 'pi pi-user',
          fieldPos: 'left',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: { required: true, minLength: 2 },
        messages: {
          required: 'First name is required',
          minLength: 'At least 2 characters',
        },
      },
      layout: { columnSpan: 6, order: 1 },
    },
    {
      formControlName: 'email',
      label: 'Email',
      placeholder: 'john@example.com',
      config: {
        attributes: {
          inputType: 'text',
          type: 'email',
          fieldIcon: 'pi pi-envelope',
          fieldPos: 'left',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: { required: true, email: true },
        messages: {
          required: 'Email is required',
          email: 'Enter a valid email',
        },
      },
      layout: { columnSpan: 6, order: 2 },
    },
    {
      formControlName: 'save',
      btnLabel: 'Save',
      config: {
        attributes: {
          inputType: 'button',
          buttonRole: 'submit',
          acceptedEvents: ['click'],
        },
      },
      layout: { columnSpan: 4, order: 3 },
    },
  ]);

  onSubmit(e: FormEngineEvent) {
    console.log('submit', e.values);
  }

  onChange(e: FormEngineEvent) {
    console.log('change', e.type, e.values);
  }
}
```

## Supported `inputType` values

`text`, `password`, `confirmPassword`, `number`, `email`, `textarea`,
`editor` (Quill rich text), `select`, `multiSelect`, `autocomplete`,
`dependentDropdown` (cascading), `datePicker`, `time`, `month`, `year`,
`toggle` (with optional card layout), `checkbox`, `radio`, `fileUpload`
(base64 + preview), `slider`, `rating`, `colorPicker`, `otp` (1.6.0),
`currency` (1.7.0), `tagInput` (1.8.0), `signature` (1.10.0),
`dragUpload` (1.12.0), `treeSelect` (1.13.0), `timeSlots` (1.14.0),
`staticText`, `divider`, `button`, `repeater` (FormArray),
`group` (nested FormGroup),
plus any custom component registered through
`FieldRegistry.registerRenderer()`.

## Wizard / stepper

```html
<ngx-json-form-stepper
  [schema]="schema"
  submitLabel="Create account"
  (formSubmit)="handleSubmit($event)" />
```

Where `schema` is a `FormSchema` with `steps: FormStep[]`.

## Documentation

See the [demo app](https://github.com/Raghav-Pal-dev/ngx-json-forms) for
end-to-end examples and the `OVERVIEW.md` for the full feature matrix.

## License

MIT
