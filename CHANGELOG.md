# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] — 2026-05-24

### Added — DX improvements driven by the consumer-side test pass

- **`provideNgxJsonForms({ storage?, translate? })`** — one-call wiring
  helper from `@ngx-json-forms/core`. Wraps the `FORM_ENGINE_STORAGE`
  and `FORM_ENGINE_TRANSLATE` injection tokens so consumers don't have
  to write the `{ provide, useValue }` boilerplate.
- **`provideFormEngineStorage(adapter)`** and
  **`provideFormEngineTranslator(fn)`** — granular factory helpers for
  the same two tokens, in case you want to wire only one of them.
- **`presets`** export — ready-made `FormField` factories for the most
  common field types, so a "five-field signup" stops being five
  hand-typed JSON blocks:
  ```ts
  import { presets } from '@ngx-json-forms/core';
  const fields = [
    presets.text({ formControlName: 'firstName', label: 'First name', required: true }),
    presets.email({ formControlName: 'email',    label: 'Email' }),
    presets.password({ formControlName: 'pwd',   label: 'Password', strong: true }),
    presets.phone({ formControlName: 'mobile',   label: 'Mobile' }),
    presets.submit({ label: 'Create account' }),
  ];
  ```
- **Inline `computed.fn`** — `computed.fn` now accepts either a
  registry token (existing behaviour) or a `ComputationFn` defined
  inline:
  ```ts
  { formControlName: 'fullName',
    computed: {
      deps: ['first', 'last'],
      fn: (deps) => `${deps['first'] ?? ''} ${deps['last'] ?? ''}`.trim(),
    },
    ... }
  ```
- **Inline `asyncValidators`** — array entries may be either tokens
  (existing behaviour) or `AsyncValidatorFn` callables. Mix freely.
- **`humaniseControlName(name)`** export — pure helper used internally
  for the error-message label fallback (see below); exported because
  it's also handy for labels in custom UIs.

### Changed — friendlier defaults

- **Error messages no longer say "firstName is required".** When a
  field has no `label`, the engine now humanises the `formControlName`
  (`firstName` → "First name") before plugging it into the default
  message template. Existing fields with explicit `label` are
  unchanged.
- **`<button buttonRole="submit">` fires `formSubmit` even when
  `acceptedEvents` doesn't list `'click'`.** This was the single most
  common "my submit button does nothing" footgun for new users.
  Non-button click handlers are still gated on `acceptedEvents` —
  nothing else changed.

### Not a breaking change

Everything in 1.1.0 is purely additive. Existing field schemas, custom
renderers, registered tokens, manually-provided storage/translate
adapters — all keep working. `npm i @ngx-json-forms/{core,primeng}@^1.1.0`
on top of any existing 1.x consumer is safe.

[1.1.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.1.0

## [1.0.2] — 2026-05-24

### Fixed
- **`NgxJsonFormStepperComponent` rendered no fields at all** (latent bug
  uncovered by the consumer-side test harness). The stepper template
  gated the inner `<ngx-json-form>` on `@if (activeStep(); as step)`,
  but `activeStep()` is a service-side computed that becomes non-null
  only after the inner form's `buildForm()` calls `register()` — which
  cannot happen until the inner form is in the DOM. The template now
  derives the active step from the schema input via `@let currentStep
  = schema().steps?.[activeIndex()]`, so the inner form always renders
  and the wizard works end-to-end (Next blocks on invalid step fields;
  Back / Submit / step-indicator clicks all behave correctly).

[1.0.2]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.0.2

## [1.0.1] — 2026-05-24

### Changed
- **`homepage` field on both packages** now points at the live demo
  (https://raghav-pal-dev.github.io/ngx-json-forms/) instead of the
  GitHub README. The "Homepage" link on each npm package page now opens
  the interactive demo directly.
- **README**: live-demo link added near the top of both packages so npm
  visitors can reach the demo from the package page itself.

No code changes — same fesm2022 bundle as 1.0.0. Safe to bump in any
existing app: `npm i @ngx-json-forms/core@^1.0.1 @ngx-json-forms/primeng@^1.0.1`.

## [1.0.0] — 2026-05-24

First public release of `@ngx-json-forms/core` and `@ngx-json-forms/primeng`.

### Added
- `FormEngineService` — JSON → `FormGroup` builder with reactive signals
  (`formValue`, `formValid`, `patchTick`), wizard helpers (`nextStep`,
  `prevStep`, `goToStep`, `validateStep`), and FormArray helpers
  (`addArrayItem`, `removeArrayItem`, `moveArrayItem`).
- `FieldRegistry` — register custom renderers, async option loaders, and
  computed-field functions by string token from JSON.
- `AsyncValidatorRegistry` — sync + async validator tokens referenced from
  `validations.rules.custom` / `validations.asyncValidators`.
- `FormPersistenceService` — localStorage-backed `bind(form, key)` /
  `save` / `load` / `clear` with a `StorageAdapter` injection token.
- `ImageUploadService` — base64 file-upload handler with append / replace
  semantics and preview tracking.
- `NgxJsonFormComponent` — PrimeNG renderer covering `text`, `password`,
  `confirmPassword`, `number`, `email`, `textarea`, `editor` (Quill),
  `select`, `multiSelect`, `autocomplete`, `dependentDropdown` (cascading),
  `datePicker`, `time`, `month`, `year`, `toggle` (with optional card
  layout), `checkbox`, `radio`, `fileUpload`, `slider`, `rating`,
  `colorPicker`, `staticText`, `divider`, `button`, `repeater`, `group`.
- `NgxJsonFormStepperComponent` — wizard wrapper driven by
  `FormSchema.steps` with header indicators and Back / Next / Submit
  controls.
- `transient` flag on `FormField` — excludes the control from the
  `buildSubmitPayload()` output (useful for computed / display fields).
- `computed` field config — re-derives a control value from other controls
  via a token registered in `FieldRegistry`.
- `showWhen` / `disableWhen` conditional visibility & disable based on
  other field values, with `eq` / `neq` / `gt` / `gte` / `lt` / `lte` /
  `in` / `notIn` / `truthy` / `falsy` / `contains` / `matches` operators.
- `crossFieldValidators` on `FormSchema` — group-level validators with
  per-field `appliesTo` error routing.
- `acceptedEvents` whitelist on each field controls which DOM events
  propagate to the host as `(formChange)`.

### Fixed
- **Live state / submit-button signal staleness.** `FormEngineService.register`
  now subscribes to `formGroup.valueChanges` / `statusChanges` and bumps
  `_patchTick`, so any consumer reading `formValue` / `formValid` updates
  on every keystroke. `formValid` in the PrimeNG renderer also reads
  `patchTick` so the submit button enables the moment the form becomes
  valid (previously stuck disabled forever).
- **Subscription leaks on schema hot-swap.** `register()` disposes the
  previous batch of computed-field subs and form-level subscriptions
  before re-attaching new ones. `NgxJsonFormComponent.buildForm` now
  tracks async-options-loader subscriptions in `optionLoaderSubs` and
  disposes them on every rebuild.
- **Repeater rows binding to the wrong FormGroup.** The shared field
  template receives the correct `FormGroup` through `ngTemplateOutletContext`
  so `formControlName` lookups inside repeater rows resolve against the
  row's group, not the root (which previously caused both "Cannot find
  control" errors and silent data corruption when a row field shared a
  name with a top-level field).
- **`placeholderVisibilityMap[...]() is not a function` crash** when
  nested fields (repeater `itemFields`, group `groupFields`) had no entry
  in the map. Replaced direct map indexing with a safe `placeholderFor()`
  helper.
- **Validation-error layout shift.** The error `<small>` is now always
  rendered for any field that has `validations.rules`, with a
  `ngx-error--placeholder` modifier and `min-height` reserving one line
  of vertical space. Triggering a required / pattern / email error no
  longer pushes sibling fields down.
- **Repeater rows showed no validation errors at all.** Added a
  `resolveRowError(row, sub)` helper and matching template block so each
  cell in a repeater row surfaces the same friendly error message as
  top-level fields, with the same reserved-space layout.
- **Default error messages fall back to readable English** when neither
  `messages.<rule>` nor a custom `TranslateFn` is provided. Previously
  consumers who forgot to set messages saw the raw i18n key
  (`form.errors.required`).
- **Toggle-card active-state highlight.** Card border + soft shadow now
  match the toggle's `--toggle-color` when checked, via
  `:has(.p-toggleswitch-checked)`.
- **Duplicate `id` attributes inside repeater rows.** Inputs in repeater
  rows now suffix the id with the row index (`emailId_0`, `emailId_1`)
  so the HTML uniqueness contract holds and `<label for>` /
  `aria-describedby` / `document.querySelector` lookups remain
  unambiguous. Top-level field ids are unchanged.
- **Packaging: dead entry-point paths in the published `package.json`.**
  Removed the hand-rolled `main` / `module` / `typings` / `exports`
  fields from the source `package.json` files so ng-packagr emits a
  correct manifest. The previously published files referenced
  `./index.js` and `./esm2022/index.mjs` which did not exist in the
  artifact — Angular esbuild (which prefers the `esm2022` condition)
  would fail to resolve them.

### Changed
- Demo hero pill + footer copy updated to "Angular 21".
- Constructor injection in `FormEngineService` and `FormPersistenceService`
  migrated to the `inject()` function (Angular ≥ 14 idiomatic).

### Known limitations / follow-ups
- **Transient `NG01050` console noise at first CD pass** when the
  field template materialises before its `[formGroup]` directive (an
  Angular `ngTemplateOutletContext` + nested `formControlName` race).
  Bindings recover and form values flow correctly afterwards. Fix
  requires inlining the field `@switch` at each call site rather than
  routing through `ngTemplateOutlet`.
- **Unit tests for `@ngx-json-forms/primeng` and `apps/demo`** —
  PrimeNG's `cascadeselect` module triggers a `ReferenceError: Cannot
  access 'CascadeSelect' before initialization` under vitest's ESM
  resolution. Test targets for these projects are no-ops until that
  upstream issue is worked around. `@ngx-json-forms/core` has unit
  tests for the `FormEngineService` API.
- **Mobile (≤ 375 px) polish** — the top-nav brand and "Get Started"
  CTA wrap, and the toggle-card title/description squish vertically.

## Migration notes for first-time consumers

Install:
```bash
npm i @ngx-json-forms/core @ngx-json-forms/primeng \
      primeng @primeng/themes primeicons quill \
      @angular/animations
```

In your `app.config.ts`:
```ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

providers: [
  provideAnimationsAsync(),
  providePrimeNG({ theme: { preset: Aura } }),
]
```

In your global styles:
```css
@import 'primeicons/primeicons.css';
```

Render a form:
```html
<ngx-json-form
  [fieldsInput]="fields"
  (formSubmit)="onSubmit($event)"
  (formChange)="onChange($event)" />
```

[1.0.1]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.0.1
[1.0.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.0.0
