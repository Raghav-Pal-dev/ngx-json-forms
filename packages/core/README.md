# @ngx-json-forms/core

The brain of `ngx-json-forms`: a JSON-driven Angular form engine. Hand it an
array of `FormField` definitions and it builds a fully reactive
`FormGroup` for you — with validation, conditional visibility, computed
fields, wizard state, FormArray helpers, and persistence — all without
any UI dependencies.

Pair it with a renderer adapter (e.g.
[`@ngx-json-forms/primeng`](https://www.npmjs.com/package/@ngx-json-forms/primeng))
to actually render the form, or write your own adapter.

**Live demo:** https://raghav-pal-dev.github.io/ngx-json-forms/  
**Try it live (StackBlitz):** [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/tests/simple.ts) — fork a ready-made Angular 21 starter with all 6 form scenarios, edit any field def, see the form re-render instantly.  
**Source:** https://github.com/Raghav-Pal-dev/ngx-json-forms

## Install

```bash
npm i @ngx-json-forms/core
```

Peer dependencies: `@angular/core`, `@angular/forms`, `rxjs` (all ≥19).

## One-call wiring (1.1.0+)

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNgxJsonForms } from '@ngx-json-forms/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxJsonForms({
      // both options optional
      // storage:   myStorageAdapter,
      // translate: (key, params) => i18n.translate(key, params),
    }),
  ],
};
```

Granular alternatives also exist: `provideFormEngineStorage(adapter)`,
`provideFormEngineTranslator(fn)`.

## Quick start

```ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormEngineService, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <input formControlName="firstName" placeholder="First name" />
      <input formControlName="email" placeholder="Email" />
      <button [disabled]="form.invalid">Save</button>
    </form>
  `,
})
export class ProfileForm {
  private readonly engine = inject(FormEngineService);

  // Use presets for the common cases, hand-roll the rest:
  fields: FormField[] = [
    presets.text({  formControlName: 'firstName', label: 'First name', required: true, minLength: 2 }),
    presets.email({ formControlName: 'email',     label: 'Email' }),
  ];

  form = this.engine.buildFormGroup(this.fields);
}
```

## What's in the box

- **`FormEngineService`** — `buildFormGroup`, signal-based `formValue` /
  `formValid` / `patchTick`, wizard helpers (`nextStep`, `prevStep`,
  `goToStep`, `validateStep`), FormArray helpers (`addArrayItem`,
  `removeArrayItem`, `moveArrayItem`), cross-field validators,
  computed-field reactive recomputation, `buildSubmitPayload()` that
  strips fields marked `transient`.
- **`FieldRegistry`** — register custom renderer components, async option
  loaders, and computed-field functions referenced by string token from
  your JSON.
- **`AsyncValidatorRegistry`** — sync + async validator tokens for
  `validations.rules.custom` / `validations.asyncValidators`.
- **`FormPersistenceService`** — `bind(form, key)` /`save` / `load` /
  `clear` against an injectable `StorageAdapter` (defaults to
  `localStorage`).
- **`ImageUploadService`** — base64 file upload with append/replace
  semantics and preview tracking.
- **Conditional visibility / disable** via `showWhen` / `disableWhen`
  with operators `eq | neq | gt | gte | lt | lte | in | notIn | truthy | falsy | contains | matches`.
- **`transient`** flag — keep a field in the live `FormGroup` but exclude
  it from the submit payload.
- **`computed`** field config — derive a control's value from other
  controls via a function token.

## From a standard JSON Schema (1.4.0+)

If you already have a JSON Schema document (an OpenAPI request body,
an Ajv validator, a backend contract, etc.), drop it into
`formFieldsFromJsonSchema` and the engine maps it to `FormField[]`
automatically:

```ts
import { formFieldsFromJsonSchema, JsonSchema } from '@ngx-json-forms/core';

const userSchema: JsonSchema = {
  type: 'object',
  required: ['email', 'role'],
  properties: {
    firstName: { type: 'string', title: 'First name', minLength: 2 },
    email:     { type: 'string', format: 'email', title: 'Email' },
    age:       { type: 'integer', title: 'Age', minimum: 13, maximum: 120 },
    role:      { type: 'string', title: 'Role', enum: ['admin','editor','viewer'] },
    address: {
      type: 'object',
      title: 'Address',
      properties: {
        street: { type: 'string', title: 'Street' },
        city:   { type: 'string', title: 'City' },
      },
    },
    phones: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kind:   { type: 'string', enum: ['home','work','mobile'] },
          number: { type: 'string', pattern: '^[0-9]{7,}$' },
        },
      },
    },
  },
};

@Component({
  template: `<ngx-json-form [fieldsInput]="fields" />`,
})
export class SignupForm {
  fields = formFieldsFromJsonSchema(userSchema, {
    layoutOverrides: { email: { columnSpan: 8, order: 3 } },
  });
}
```

Supported JSON Schema features:

| JSON Schema                                  | Maps to                          |
|----------------------------------------------|----------------------------------|
| `type: 'string'`                             | `text` input                     |
| `type: 'string', format: 'email'`            | text + `type=email` + email validator |
| `type: 'string', format: 'password'`         | `password` with toggle-mask      |
| `type: 'string', format: 'date'` / `date-time` / `time` | `datePicker` / `time`  |
| `type: 'string', format: 'uri'` / `'tel'`    | text + `type=url` / `tel`        |
| `type: 'string', enum: [...]`                | `select` with options            |
| `type: 'number'` / `'integer'`               | text + `type=number`             |
| `type: 'boolean'`                            | `toggle`                         |
| `type: 'array'` of `'object'`                | `repeater`                       |
| `type: 'array'` of enum strings              | `multiSelect`                    |
| `type: 'object'`                             | `group` (nested FormGroup)       |
| `required`, `minLength`, `maxLength`, `minimum`, `maximum`, `pattern` | `validations.rules` |
| `title`, `description`, `default`, `readOnly`, `examples[0]` | `label`, `info`, `value`, `readonly`, `placeholder` |
| `$ref: '#/$defs/Foo'` / `'#/definitions/Foo'` | resolved in-document             |

Not (yet) supported: `allOf`, `anyOf`, `oneOf`, external `$ref`s, tuple
arrays, `additionalProperties`, `patternProperties`, `dependencies`.
For those you'll need to pre-bundle / pre-flatten the schema with a
tool like `json-schema-ref-parser` first.

## Computed fields — inline functions (1.1.0+)

```ts
{
  formControlName: 'fullName',
  transient: true,             // don't include in the submit payload
  computed: {
    deps: ['firstName', 'lastName'],
    fn: (deps) => `${deps['firstName'] ?? ''} ${deps['lastName'] ?? ''}`.trim(),
  },
  config: { attributes: { inputType: 'text', readonly: true } },
}
```

`computed.fn` still accepts a registry token (string) for cases where
you want to share the computation across forms — both forms work.

## Custom translations

Inject your own translator to localise default error messages:

```ts
import { FORM_ENGINE_TRANSLATE, TranslateFn } from '@ngx-json-forms/core';

const t: TranslateFn = (key, params) => yourI18n.translate(key, params);

providers: [{ provide: FORM_ENGINE_TRANSLATE, useValue: t }]
```

If you don't provide one, sensible English defaults are used
(`"{label} is required"`, `"Enter a valid email address"`, etc.).

## Custom storage

```ts
import { FORM_ENGINE_STORAGE, StorageAdapter } from '@ngx-json-forms/core';

providers: [{ provide: FORM_ENGINE_STORAGE, useClass: MyStorageAdapter }]
```

## Documentation

Full type definitions ship with the package. See the demo app + OVERVIEW
in [the repo](https://github.com/Raghav-Pal-dev/ngx-json-forms) for end-to-end
examples of every supported field type, the wizard / stepper, conditional
fields, and repeaters.

## License

MIT
