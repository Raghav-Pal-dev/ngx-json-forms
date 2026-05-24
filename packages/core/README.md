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
