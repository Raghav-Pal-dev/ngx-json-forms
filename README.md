<div align="center">

# ngx-json-forms

### Build any Angular form from a JSON config — rendering, validation, layout, conditional logic, computed values, repeaters and wizards, with zero template code.

[![core](https://img.shields.io/npm/v/@ngx-json-forms/core?color=10b981&label=core)](https://www.npmjs.com/package/@ngx-json-forms/core)
[![primeng](https://img.shields.io/npm/v/@ngx-json-forms/primeng?color=10b981&label=primeng)](https://www.npmjs.com/package/@ngx-json-forms/primeng)
[![downloads](https://img.shields.io/npm/dm/@ngx-json-forms/primeng?color=2563eb&label=downloads%2Fmo)](https://www.npmjs.com/package/@ngx-json-forms/primeng)
[![license](https://img.shields.io/npm/l/@ngx-json-forms/core?color=64748b)](LICENSE)
[![Angular](https://img.shields.io/badge/Angular-%E2%89%A519-dd0031?logo=angular&logoColor=white)](https://angular.dev)

**[🖥 Live demo](https://raghav-pal-dev.github.io/ngx-json-forms/)** &nbsp;·&nbsp;
**[⚡ Try on StackBlitz](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts)**

</div>

---

### Install — one command for everything

```bash
ng add @ngx-json-forms/primeng
```

That installs both packages + PrimeNG + the Aura theme + primeicons + animations,
and wires `provideNgxJsonFormsPrimeng()` into your `app.config.ts`. Angular ≥ 21.2.
No three-step manual setup, no peer-dep dance.

---

A data-driven, declarative Angular form engine. Define your entire form as a JSON
config — the library handles rendering, validation, layout, conditional logic,
repeaters, wizards and events. UI-agnostic core + swappable renderer adapters.

**Why?** Forms become *data* you can store, version and fetch from a backend — no more
hand-wiring `FormGroup`s, validators, `valueChanges` subscriptions or `*ngIf` chains.
40+ field types, all themed and validated, render from one array.

👉 **Browse every field with a live preview + copy-paste config at the
[live demo](https://raghav-pal-dev.github.io/ngx-json-forms/)**, or fork the
[StackBlitz playground](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts)
to edit and run in your browser.

## Packages

| Package | Description | npm |
|---|---|---|
| `@ngx-json-forms/core` | Types, form builder, validation engine, registries, services | [![npm](https://img.shields.io/npm/v/@ngx-json-forms/core)](https://www.npmjs.com/package/@ngx-json-forms/core) |
| `@ngx-json-forms/primeng` | PrimeNG adapter (renderer + stepper) | [![npm](https://img.shields.io/npm/v/@ngx-json-forms/primeng)](https://www.npmjs.com/package/@ngx-json-forms/primeng) |

## Quick Start (PrimeNG) — one command

```bash
ng add @ngx-json-forms/primeng
```

That installs both packages + PrimeNG + the Aura theme + primeicons, and
wires `provideNgxJsonFormsPrimeng()` (theme + animations + form engine)
into your `app.config.ts`. Requires Angular ≥ 21.2 — older versions will
ERESOLVE at install time so you know to upgrade.

The schematic auto-writes this `app.config.ts` — one line of setup:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNgxJsonFormsPrimeng } from '@ngx-json-forms/primeng';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideNgxJsonFormsPrimeng(),   // ← theme + animations + form engine
  ],
};
```

## Try it — paste this into `app.ts`

A single FormField[] that exercises every major feature: all 4 validation
rules (with error messages), the v1.21 `inputType` aliases, conditional
`showWhen`, the `visible` vs `isHidden` distinction, `acceptedEvents`,
icons, info hints, and the `layout` grid (`columnSpan` + `order`).

```ts
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormField, FormEngineEvent } from '@ngx-json-forms/core';

@Component({
  selector: 'app-root',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <ngx-json-form
      formTitle="Feature showcase"
      [fieldsInput]="fields"
      (formSubmit)="onSubmit($event)"
      (formChange)="onChange($event)" />

    @if (submitted(); as v) {
      <pre>{{ v | json }}</pre>
    }
  `,
})
export class AppComponent {
  submitted = signal<unknown>(null);

  fields: FormField[] = [
    /* ── All four validation rules on one field, custom error messages ──
       required, minLength, maxLength, pattern — all auto-rendered below.
       `acceptedEvents` lists which DOM events bubble to (formChange).      */
    {
      formControlName: 'username',
      label: 'Username',
      placeholder: 'lowercase, 3–12 chars, [a-z0-9_]',
      config: {
        attributes: {
          inputType: 'text',
          fieldIcon: 'pi pi-user',           // left-addon icon
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          required: true,
          minLength: 3,
          maxLength: 12,
          pattern: '^[a-z0-9_]+$',
        },
        messages: {                          // override default error text
          pattern: 'Only lowercase letters, digits and "_" are allowed.',
        },
      },
      layout: { columnSpan: 6, order: 1 },   // half-row, render position #1
    },

    /* ── v1.21 InputType alias: 'email' renders <input type="email"> ──── */
    {
      formControlName: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      config: { attributes: { inputType: 'email', fieldIcon: 'pi pi-envelope' } },
      validations: { rules: { required: true, email: true } },
      layout: { columnSpan: 6, order: 2 },
    },

    /* ── 'number' alias + min/max range validators ───────────────────── */
    {
      formControlName: 'age',
      label: 'Age',
      config: { attributes: { inputType: 'number' } },
      validations: { rules: { required: true, min: 13, max: 120 } },
      layout: { columnSpan: 4, order: 3 },
    },

    /* ── Select with options + info hint below the field ────────────── */
    {
      formControlName: 'country',
      label: 'Country',
      placeholder: 'Choose…',
      config: {
        attributes: {
          inputType: 'select',
          options: [
            { label: 'India',          value: 'IN' },
            { label: 'United States',  value: 'US' },
            { label: 'United Kingdom', value: 'UK' },
          ],
          optionLabel: 'label',
          optionValue: 'value',
          info: 'Picking India will reveal a City dropdown below.',
        },
      },
      validations: { rules: { required: true } },
      layout: { columnSpan: 8, order: 4 },
    },

    /* ── Conditional: only rendered when country === 'IN' ──────────── */
    {
      formControlName: 'city',
      label: 'City',
      placeholder: 'Choose…',
      config: {
        attributes: {
          inputType: 'select',
          options: [
            { label: 'Mumbai',    value: 'BOM' },
            { label: 'Delhi',     value: 'DEL' },
            { label: 'Bangalore', value: 'BLR' },
          ],
          optionLabel: 'label',
          optionValue: 'value',
        },
      },
      showWhen: { conditions: [{ field: 'country', operator: 'eq', value: 'IN' }] },
      validations: { rules: { required: true } },
      layout: { columnSpan: 6, order: 5 },
    },

    /* ── visible vs isHidden — DIFFERENT semantics ──────────────────────
       `visible: false`  → field is NOT BUILT.  No FormControl, no DOM,
                           validations never fire. Use for role-based
                           hiding ("admin-only field").

       `isHidden: true`  → field IS built (FormControl exists, validates,
                           appears in submit payload) but rendered with
                           `display: none`. Use for hidden tokens,
                           computed-only values you still want submitted.
       Two examples below — submit the form to see which appears in the
       payload (csrfToken yes; adminOnly no).                              */
    {
      formControlName: 'adminOnly',
      label: 'Admin notes (visible: false)',
      config: { attributes: { inputType: 'text', visible: false } },
      validations: { rules: { required: true } },   // never fires
      layout: { columnSpan: 12, order: 6 },
    },
    {
      formControlName: 'csrfToken',
      label: 'CSRF token (isHidden: true)',
      config: {
        attributes: {
          inputType: 'text',
          isHidden: true,
          value: 'auto-generated-' + Math.random().toString(36).slice(2, 10),
        },
      },
      validations: { rules: { required: true } },   // STILL VALIDATES
      layout: { columnSpan: 12, order: 7 },
    },

    /* ── Textarea + maxLength (the "characters remaining" pattern) ──── */
    {
      formControlName: 'bio',
      label: 'Bio',
      placeholder: 'A few words about yourself…',
      config: {
        attributes: {
          inputType: 'textarea',
          autoResize: true,
          rows: 3,
          acceptedEvents: ['input'],
        },
      },
      validations: {
        rules: { maxLength: 200 },
        messages: { maxLength: 'Bio must be ≤ 200 characters.' },
      },
      layout: { columnSpan: 12, order: 8 },
    },

    /* ── Buttons: acceptedEvents MUST include 'click' to bubble it ──── */
    {
      formControlName: 'submit',
      btnLabel: 'Submit',
      labelIcon: 'pi pi-send',
      config: {
        attributes: {
          inputType: 'button',
          buttonRole: 'submit',
          acceptedEvents: ['click'],   // common gotcha — omit and (formSubmit) won't fire
        },
      },
      layout: { columnSpan: 3, order: 9 },
    },
    {
      formControlName: 'reset',
      btnLabel: 'Reset',
      config: {
        attributes: {
          inputType: 'button',
          buttonRole: 'reset',
          buttonSeverity: 'secondary',
          acceptedEvents: ['click'],
        },
      },
      layout: { columnSpan: 3, order: 10 },
    },
  ];

  onSubmit(e: FormEngineEvent) { this.submitted.set(e.values); }
  onChange(e: FormEngineEvent) { console.log('change:', e); }
}
```

Manual install instead of `ng add`:

```bash
npm install @ngx-json-forms/core @ngx-json-forms/primeng \
            primeng @primeng/themes primeicons \
            --legacy-peer-deps
```

## Supported Field Types (PrimeNG adapter)

| `inputType` | Component |
|---|---|
| `text` | `pInputText` (also handles `email`, `number`, `url`) |
| `password` / `confirmPassword` | `p-password` |
| `textarea` | `p-textarea` |
| `editor` | `p-editor` (Quill-based rich text) |
| `select` | `p-select` |
| `multiSelect` | `p-multiselect` |
| `autocomplete` | `p-autocomplete` |
| `dependentDropdown` | `p-cascadeselect` (cascading levels) |
| `toggle` | `p-toggleswitch` (supports `cardLayout`) |
| `checkbox` | `p-checkbox` |
| `radio` | `p-radiobutton` |
| `datePicker` | `p-datepicker` |
| `time` / `month` / `year` | `p-datepicker` view variants |
| `fileUpload` | `p-fileupload` with base64 preview |
| `slider` | `p-slider` |
| `rating` | `p-rating` |
| `colorPicker` | `p-colorpicker` |
| `staticText` | Inline HTML span |
| `divider` | `p-divider` |
| `button` | `pButton` (`buttonRole`: `submit` / `reset` / `cancel` / `custom`) |
| `repeater` | FormArray rendered as repeating row template |
| `group` | Nested FormGroup |
| _any custom_ | Component registered via `FieldRegistry.registerRenderer()` |

## FormField Schema

```ts
interface FormField {
  formControlName?: string;
  label?: string;
  placeholder?: string;
  floatLabel?: boolean;
  floatVariant?: 'on' | 'in' | 'over';
  btnLabel?: string;
  labelIcon?: string;
  labelIconPos?: 'left' | 'right';
  tabIndex?: number;
  transient?: boolean;                 // omit from submit payload
  computed?: { deps: string[]; fn: string }; // derived field via FieldRegistry
  config: { attributes: FieldAttributes };
  validations?: {
    rules?: { required, minLength, maxLength, min, max, pattern, email, matches, custom };
    messages?: { [ruleName]: string };
    asyncValidators?: string[];        // tokens registered via AsyncValidatorRegistry
  };
  layout?: { columnSpan: number; order?: number; wrapperClass?: string; wrapperStyle?: Record<string, string> };
  showWhen?: ConditionTree;            // conditional visibility
  disableWhen?: ConditionTree;         // conditional disable
}
```

## External Control via `FormEngineService`

```ts
const svc = inject(FormEngineService);

svc.setValue('name', 'Alice');
svc.patchValue({ name: 'Alice', country: 'IN' });
svc.reset();
svc.disable('name');
svc.enableForm();
svc.updateFieldAttributes('country', { options: newOptions, loading: false });
svc.updateFieldValidations('name', { rules: { required: false } });
svc.addField(newField);
svc.removeField('name');

// Repeater (FormArray) APIs
svc.addArrayItem('contacts', { email: 'a@b.com' });
svc.removeArrayItem('contacts', 0);
svc.moveArrayItem('contacts', 0, 1);

// Wizard APIs
svc.goToStep(0);
svc.nextStep();           // validates current step first
svc.prevStep();
svc.isStepValid(0);

const isValid = svc.markAllAsTouchedAndValidate();
const payload = svc.buildSubmitPayload();   // strips `transient` fields
```

## Conditional Fields (`showWhen` / `disableWhen`)

```ts
{
  formControlName: 'vatNumber',
  showWhen: {
    conditions: [{ field: 'isCompany', operator: 'eq', value: true }],
    logic: 'and',
  },
  disableWhen: {
    conditions: [{ field: 'status', operator: 'in', value: ['locked', 'archived'] }],
  },
}
```

Operators: `eq` `neq` `gt` `gte` `lt` `lte` `in` `notIn` `truthy` `falsy` `contains` `matches`

Dotted paths are supported (`user.address.city`).

## Repeater (FormArray)

```ts
{
  formControlName: 'contacts',
  label: 'Contacts',
  config: {
    attributes: {
      inputType: 'repeater',
      itemFields: [
        { formControlName: 'name',  label: 'Name',  config: { attributes: { inputType: 'text' } }, layout: { columnSpan: 6 } },
        { formControlName: 'email', label: 'Email', config: { attributes: { inputType: 'text', type: 'email' } }, layout: { columnSpan: 6 } },
      ],
      minRows: 1,
      maxRows: 5,
      addLabel: 'Add contact',
    },
  },
}
```

## Wizard / Stepper

```ts
import { NgxJsonFormStepperComponent } from '@ngx-json-forms/primeng';
import { FormSchema } from '@ngx-json-forms/core';

const schema: FormSchema = {
  formId: 'onboarding',
  steps: [
    { id: 'basics',   title: 'Basics',   fields: [...] },
    { id: 'address',  title: 'Address',  fields: [...] },
    { id: 'review',   title: 'Review',   fields: [...], skipValidation: true },
  ],
};
```

```html
<ngx-json-form-stepper
  [schema]="schema"
  submitLabel="Create account"
  (formSubmit)="onComplete($event)" />
```

## Custom Field Renderers

Register your own component once and reference it by `inputType` from JSON:

```ts
import { FieldRegistry } from '@ngx-json-forms/core';

const registry = inject(FieldRegistry);
registry.registerRenderer('signaturePad', MySignaturePadComponent);
```

Your component must accept `field` and `formGroup` as inputs.

## Async Options Loader

Drop in cascading or remote-loaded options:

```ts
registry.registerOptionsLoader('cities', async ({ state }) => {
  const res = await fetch(`/api/cities?state=${state}`);
  return res.json();
});
```

```ts
{
  formControlName: 'city',
  config: {
    attributes: {
      inputType: 'select',
      optionsLoader: 'cities',
      optionsDependsOn: ['state'],
      optionLabel: 'name', optionValue: 'id',
    },
  },
}
```

## Computed Fields

```ts
registry.registerComputation('fullName',
  ({ firstName, lastName }) => `${firstName ?? ''} ${lastName ?? ''}`.trim()
);
```

```ts
{
  formControlName: 'fullName',
  label: 'Full Name',
  computed: { deps: ['firstName', 'lastName'], fn: 'fullName' },
  config: { attributes: { inputType: 'text' } },
}
```

## Async Validators

```ts
import { AsyncValidatorRegistry } from '@ngx-json-forms/core';

const v = inject(AsyncValidatorRegistry);
v.registerAsync('uniqueUsername', usernameAvailableValidator);

// JSON: validations: { asyncValidators: ['uniqueUsername'] }
```

## Cross-field Validators

```ts
const schema: FormSchema = {
  fields: [...],
  crossFieldValidators: [
    {
      name: 'passwordsMatch',
      message: 'Passwords must match',
      appliesTo: ['confirm'],
      validate: (v) => v['password'] === v['confirm'],
    },
  ],
};
```

## Persistence

```ts
import { FormPersistenceService } from '@ngx-json-forms/core';

const persist = inject(FormPersistenceService);
persist.bind(formGroup, 'onboarding-draft'); // auto save/restore
```

## i18n

```ts
import { FORM_ENGINE_TRANSLATE } from '@ngx-json-forms/core';

providers: [
  { provide: FORM_ENGINE_TRANSLATE, useValue: (key, params) => myI18n.t(key, params) },
]
```

The default keys: `form.errors.required` `form.errors.email` `form.errors.minLength`
`form.errors.maxLength` `form.errors.min` `form.errors.max` `form.errors.pattern` `form.errors.matches`.

## Writing a Custom Adapter

1. Install `@ngx-json-forms/core`
2. Inject `FormEngineService` and `ImageUploadService`
3. Call `formService.buildFormGroup(fields)` to get the `FormGroup`
4. Render your own `@switch` template over `field.config.attributes.inputType`
5. Call `formService.register(formGroup, fields, schema?)` after build

See `@ngx-json-forms/primeng` as a reference implementation.

## Requirements

- Angular `>=19.0.0`
- `@angular/forms` `>=19.0.0`

## License

MIT
