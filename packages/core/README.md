<div align="center">

# @ngx-json-forms/core

### Build any Angular form from a JSON config — validation, conditional logic, computed values, wizards and repeaters, with zero template code.

[![npm version](https://img.shields.io/npm/v/@ngx-json-forms/core?color=10b981&label=npm)](https://www.npmjs.com/package/@ngx-json-forms/core)
[![downloads](https://img.shields.io/npm/dm/@ngx-json-forms/core?color=2563eb)](https://www.npmjs.com/package/@ngx-json-forms/core)
[![license](https://img.shields.io/npm/l/@ngx-json-forms/core?color=64748b)](https://github.com/Raghav-Pal-dev/ngx-json-forms/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-%E2%89%A519-dd0031?logo=angular&logoColor=white)](https://angular.dev)

**[🖥 Live demo](https://raghav-pal-dev.github.io/ngx-json-forms/)** &nbsp;·&nbsp;
**[⚡ Try on StackBlitz](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts)** &nbsp;·&nbsp;
**[📦 Source](https://github.com/Raghav-Pal-dev/ngx-json-forms)**

</div>

---

`@ngx-json-forms/core` is the **UI-agnostic brain** of `ngx-json-forms`. Hand it an
array of `FormField` definitions and it builds a fully reactive Angular `FormGroup`
for you — with validation, conditional visibility, computed fields, wizard state,
`FormArray` repeaters and persistence — **without any UI dependencies**.

Pair it with a renderer adapter such as
[`@ngx-json-forms/primeng`](https://www.npmjs.com/package/@ngx-json-forms/primeng)
to render the form, or write your own.

## Why use it?

- **Forms become data.** A `FormField[]` is JSON — store it, version it, A/B-test it,
  or fetch it from your backend and render a different form per tenant. No redeploy to
  change a form.
- **Stop hand-wiring `FormGroup`s.** No more `new FormGroup({...})`, manual validators,
  `valueChanges` subscriptions, or `*ngIf` spaghetti for conditional fields.
- **Batteries included.** Cross-field validators, async validators, computed/derived
  fields, multi-step wizards, repeaters and auto-save are first-class — not things you
  re-invent on every project.
- **Bring your own UI.** The engine emits a plain reactive `FormGroup`; the renderer is
  swappable. Use the PrimeNG adapter or build one for your design system.
- **Standards-friendly.** Already have a **JSON Schema**? Convert it to fields with one
  call (`formFieldsFromJsonSchema`).

## Try it before you install

| | |
|---|---|
| 🖥 **Live demo** | [raghav-pal-dev.github.io/ngx-json-forms](https://raghav-pal-dev.github.io/ngx-json-forms/) — browse every field with a live preview + copy-paste config |
| ⚡ **StackBlitz** | [fork the playground](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts) — edit `catalog.ts`, watch the form re-render instantly. No install. |

## Install

```bash
npm i @ngx-json-forms/core
```

Peer dependencies: `@angular/core`, `@angular/forms`, `rxjs` (all ≥ 19).

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

  // Presets for the common cases, hand-roll the rest:
  fields: FormField[] = [
    presets.text({  formControlName: 'firstName', label: 'First name', required: true, minLength: 2 }),
    presets.email({ formControlName: 'email',     label: 'Email' }),
  ];

  form = this.engine.buildFormGroup(this.fields);
}
```

> 💡 Want the form **rendered for you** (inputs, validation messages, layout)? Add
> [`@ngx-json-forms/primeng`](https://www.npmjs.com/package/@ngx-json-forms/primeng)
> and drop in `<ngx-json-form [fieldsInput]="fields" />`.

## One-call wiring (optional)

```ts
import { provideNgxJsonForms } from '@ngx-json-forms/core';

export const appConfig = {
  providers: [
    provideNgxJsonForms({
      // storage:   myStorageAdapter,                              // for persistKey auto-save
      // translate: (key, params) => i18n.translate(key, params), // localise error text
    }),
  ],
};
```

Granular alternatives: `provideFormEngineStorage(adapter)`, `provideFormEngineTranslator(fn)`.

## What's in the box

- **`FormEngineService`** — `buildFormGroup`, signal-based `formValue` / `formValid` /
  `patchTick`, wizard helpers (`nextStep`, `prevStep`, `goToStep`, `validateStep`),
  `FormArray` helpers (`addArrayItem`, `removeArrayItem`, `moveArrayItem`), cross-field
  validators, computed-field recomputation, and `buildSubmitPayload()` that strips
  `transient` fields.
- **`FieldRegistry`** — register custom renderer components, async option loaders, and
  computed-field functions referenced by string token from JSON.
- **`AsyncValidatorRegistry`** — sync + async validator tokens for
  `validations.rules.custom` / `validations.asyncValidators`.
- **`FormPersistenceService`** — `bind(form, key)` / `save` / `load` / `clear` against an
  injectable `StorageAdapter` (defaults to `localStorage`).
- **Conditional visibility / disable** via `showWhen` / `disableWhen` with operators
  `eq | neq | gt | gte | lt | lte | in | notIn | truthy | falsy | contains | matches`.
- **`transient`** — keep a field in the live `FormGroup` but exclude it from the payload.
- **`computed`** — derive a control's value from other controls, live.

## Computed fields (inline function)

```ts
{
  formControlName: 'fullName',
  transient: true,                 // not in the submit payload
  computed: {
    deps: ['firstName', 'lastName'],
    fn: (deps) => `${deps['firstName'] ?? ''} ${deps['lastName'] ?? ''}`.trim(),
  },
  config: { attributes: { inputType: 'text', readonly: true } },
}
```

`computed.fn` also accepts a registry token (string) so a computation can be shared
across forms.

## From a standard JSON Schema

Already have a JSON Schema (an OpenAPI request body, an Ajv validator, a backend
contract)? Map it to `FormField[]` automatically:

```ts
import { formFieldsFromJsonSchema, JsonSchema } from '@ngx-json-forms/core';

const userSchema: JsonSchema = {
  type: 'object',
  required: ['email', 'role'],
  properties: {
    firstName: { type: 'string', title: 'First name', minLength: 2 },
    email:     { type: 'string', format: 'email', title: 'Email' },
    role:      { type: 'string', title: 'Role', enum: ['admin', 'editor', 'viewer'] },
  },
};

fields = formFieldsFromJsonSchema(userSchema);
```

| JSON Schema                                       | Maps to                       |
|---------------------------------------------------|-------------------------------|
| `string` / `format: email` / `password`           | text / email / password       |
| `format: date` / `date-time` / `time`             | `datePicker` / `time`         |
| `string, enum`                                    | `select`                      |
| `number` / `integer`                              | numeric text                  |
| `boolean`                                         | `toggle`                      |
| `array` of `object` / of enum strings             | `repeater` / `multiSelect`    |
| `object`                                          | `group` (nested FormGroup)    |
| `required`, `minLength`, `pattern`, `minimum`, …  | `validations.rules`           |

> Not yet: `allOf` / `anyOf` / `oneOf`, external `$ref`s, tuple arrays. Pre-flatten with
> `json-schema-ref-parser` for those.

## Custom translations & storage

```ts
import { FORM_ENGINE_TRANSLATE, FORM_ENGINE_STORAGE } from '@ngx-json-forms/core';

providers: [
  { provide: FORM_ENGINE_TRANSLATE, useValue: (key, params) => yourI18n.t(key, params) },
  { provide: FORM_ENGINE_STORAGE,   useClass: MyStorageAdapter },
]
```

Without a translator, sensible English defaults are used
(`"{label} is required"`, `"Enter a valid email address"`, …).

## License

MIT © [Raghvendrasing Pal](https://github.com/Raghav-Pal-dev)
