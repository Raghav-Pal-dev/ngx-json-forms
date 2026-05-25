# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] — 2026-05-25

### Added — `presets.dateRange()` + `presets.endAfterStart()` cross-field validator

A focused convenience layer over the existing `datePicker` renderer
for the "check-in / check-out", "reporting period", "billing window"
pattern. No new InputType — `dateRange` is a configured `datePicker`
(`selectionMode: 'range'`, 2 calendars, button bar), so anything that
already works for `datePicker` continues to work.

Bound value is `[Date, Date | null]` — the second entry is `null`
while the user is mid-selection.

```ts
import { presets, FormSchema } from '@ngx-json-forms/core';

const schema: FormSchema = {
  fields: [
    presets.dateRange({
      formControlName: 'stay',
      label: 'Hotel stay',
      minToday: true,        // no past dates
      required: true,
    }),
    presets.dateRange({
      formControlName: 'reporting',
      label: 'Reporting period',
      dateFormat: 'yy-mm-dd',
    }),
    presets.submit({ label: 'Book' }),
  ],
  crossFieldValidators: [
    // Default: end strictly > start (rejects same-day).
    presets.endAfterStart({ formControlName: 'stay' }),

    // strict: false → allow same-day (end >= start).
    presets.endAfterStart({ formControlName: 'reporting', strict: false }),

    // Two-control mode (separate start/end pickers):
    // presets.endAfterStart({ startControlName: 'from', endControlName: 'to' }),
  ],
};
```

**`presets.dateRange(...)` options:**

| Option            | Default | Description                                          |
|-------------------|---------|------------------------------------------------------|
| `formControlName` | —       | Required.                                            |
| `label`           | —       | Field label.                                         |
| `dateFormat`      | —       | PrimeNG format (`'mm/dd/yy'`, `'yy-mm-dd'`, …).      |
| `minToday`        | `false` | Block past dates.                                    |
| `maxToday`        | `false` | Block future dates.                                  |
| `minOffsetDays`   | —       | Offset from today for the minimum date.              |
| `maxOffsetDays`   | —       | Offset from today for the maximum date.              |
| `numberOfMonths`  | `2`     | Side-by-side calendars.                              |
| `showButtonBar`   | `true`  | Show Today / Clear bar.                              |
| `showIcon`        | `true`  | Show calendar icon next to input.                    |
| `required`        | `false` | Whether the range is required.                       |
| `columnSpan`      | `12`    | PrimeFlex column span.                               |

**`presets.endAfterStart(...)` options:**

| Option              | Default          | Description                                            |
|---------------------|------------------|--------------------------------------------------------|
| `formControlName`   | —                | Range control (value: `[Date, Date \| null]`).         |
| `startControlName`  | —                | Start control (two-control mode).                      |
| `endControlName`    | —                | End control (two-control mode).                        |
| `strict`            | `true`           | `true` → end > start. `false` → end >= start.          |
| `name`              | `'endAfterStart'`| Error key under `errors['crossField:<name>']`.         |
| `message`           | (sensible default)| Inline error message.                                 |

Live demo: `/date-range` route in the StackBlitz playground.

---

## [1.8.0] — 2026-05-25

### Added — `tagInput` field type + `presets.tagInput()`

Chip-style multi-token entry. Type a value, press <kbd>Enter</kbd>
(or the configured separator), and it becomes a chip; click the X to
remove. The bound form value is a plain `string[]` — no
`{label, value}` object wrapping to unwind on submit.

Backed by `<p-autocomplete multiple typeahead="false">` because
PrimeNG dropped `<p-chips>` in v21.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ title: string; tags: string[]; invitees: string[] }>([
  presets.text({ formControlName: 'title', label: 'Post title', required: true }),

  presets.tagInput({ formControlName: 'tags', label: 'Tags' }),

  // Comma-separated invitee list, 1–10 emails required.
  presets.tagInput({
    formControlName: 'invitees',
    label: 'Invite team members',
    placeholder: 'jane@acme.com, john@acme.com',
    separator: ',',
    required: true,
    minTags: 1,
    maxTags: 10,
  }),
]);
```

**Options on `presets.tagInput(...)`:**

| Option            | Default | Description                                       |
|-------------------|---------|---------------------------------------------------|
| `formControlName` | —       | Required.                                         |
| `label`           | —       | Field label.                                      |
| `placeholder`     | —       | Greyed hint inside the input area.                |
| `separator`       | —       | Char that auto-commits when typed (e.g. `','`).   |
| `unique`          | `true`  | Reject duplicate tags.                            |
| `addOnBlur`       | `true`  | Commit pending text as a tag on blur.             |
| `addOnTab`        | `true`  | Commit pending text as a tag on Tab.              |
| `required`        | `false` | Whether the array must be non-empty.              |
| `minTags`         | —       | Minimum tag count (maps to array `minLength`).    |
| `maxTags`         | —       | Maximum tag count (maps to array `maxLength`).    |
| `columnSpan`      | `12`    | PrimeFlex column span.                            |

Live demo: `/tag-input` route in the StackBlitz playground.

---

## [1.7.0] — 2026-05-25

### Added — `currency` field type + `presets.currency()`

Localised currency input backed by PrimeNG's
`<p-inputnumber mode="currency">`. Handles currency-symbol prefix,
locale-aware grouping (1,234,567 vs 1.234.567 vs 1,23,4567), fraction
digits, optional spinner buttons, min/max bounds — all in one preset.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ priceUsd: number; priceEur: number; priceJpy: number }>([
  // Default: USD, en-US, 2 fraction digits, min 0.
  presets.currency({ formControlName: 'priceUsd', label: 'Price (USD)' }),

  // EUR with German locale — comma as decimal, dot as thousands.
  presets.currency({
    formControlName: 'priceEur',
    label: 'Price (EUR)',
    currency: 'EUR',
    locale: 'de-DE',
  }),

  // INR with Indian grouping (1,00,000 not 100,000).
  presets.currency({
    formControlName: 'priceInr',
    currency: 'INR',
    locale: 'en-IN',
  }),

  // JPY — zero-decimal currency, capped.
  presets.currency({
    formControlName: 'priceJpy',
    currency: 'JPY',
    locale: 'ja-JP',
    minFractionDigits: 0,
    maxFractionDigits: 0,
    max: 1_000_000,
  }),
]);
```

**Options on `presets.currency(...)`:**

| Option              | Default     | Description                                       |
|---------------------|-------------|---------------------------------------------------|
| `formControlName`   | —           | Required.                                         |
| `label`             | —           | Field label.                                      |
| `currency`          | `'USD'`     | ISO 4217 code (USD, EUR, INR, JPY, GBP, …).       |
| `locale`            | `'en-US'`   | BCP 47 tag — drives grouping + decimal separator. |
| `currencyDisplay`   | `'symbol'`  | `'symbol'` (€) \| `'code'` (EUR) \| `'name'`.     |
| `min`               | `0`         | Lower bound (negatives need `min: -Infinity`).    |
| `max`               | —           | Upper bound.                                      |
| `minFractionDigits` | `2`         | Drop to `0` for JPY/KRW/etc.                      |
| `maxFractionDigits` | `2`         | Match `minFractionDigits` for fixed-decimals.     |
| `showButtons`       | `false`     | +/- spinner buttons next to the input.            |
| `required`          | `true`      | Whether the field is required.                    |
| `columnSpan`        | `12`        | PrimeFlex column span.                            |

You can also hand-roll the FormField directly — every prop is on
`FieldAttributes` (`mode`, `currency`, `locale`, `currencyDisplay`,
`minFractionDigits`, `maxFractionDigits`, `useGrouping`, `showButtons`,
`prefix`, `suffix`, `allowEmpty`).

Live demo: `/currency` route in the StackBlitz playground.

---

## [1.6.0] — 2026-05-25

### Added — `otp` field type + `presets.otp()`

A dedicated `inputType: 'otp'` renderer backed by PrimeNG's
`<p-inputotp>`. Use it for any "enter N characters" UX: verification
codes, PINs, backup codes, 2FA challenges.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ email: string; code: string; pin: string }>([
  presets.email({ formControlName: 'email', label: 'Email' }),

  // Default: 6 digits, required, pattern auto-matches length.
  presets.otp({ formControlName: 'code', label: 'Verification code' }),

  // 4-digit masked PIN.
  presets.otp({ formControlName: 'pin', label: 'PIN', length: 4, mask: true }),

  // 8-character alphanumeric backup code.
  presets.otp({
    formControlName: 'backup',
    label: 'Backup code',
    length: 8,
    integerOnly: false,
  }),

  presets.submit({ label: 'Verify' }),
]);
```

Or hand-roll the FormField if you want full control:

```ts
{
  formControlName: 'code',
  label: 'Verification code',
  config: {
    attributes: {
      inputType: 'otp',
      length: 6,
      mask: false,
      integerOnly: true,
      acceptedEvents: ['change', 'blur'],
    },
  },
}
```

**Options on `presets.otp(...)`:**

| Option            | Default | Description                                |
|-------------------|---------|--------------------------------------------|
| `formControlName` | —       | Required.                                  |
| `label`           | —       | Field label above the boxes.               |
| `length`          | `6`     | Number of OTP cells.                       |
| `mask`            | `false` | Mask each character (treat as a secret).   |
| `integerOnly`     | `true`  | Only digits 0–9 are accepted.              |
| `required`        | `true`  | Whether the field is required.             |
| `columnSpan`      | `12`    | PrimeFlex column span (1–12).              |

The preset auto-derives a `pattern` validator matching the chosen
length, so partial codes never pass validation.

Live demo: `/otp` route in the StackBlitz playground.

---

## [1.5.0] — 2026-05-25

### Added — `ng g @ngx-json-forms/primeng:form <name>` scaffold

Generates a fully typed standalone Angular component pre-wired with a
`defineForm<T>()` schema, built from a comma-separated field list.
Common field names (`email`, `password`, `phone`, `remember`, …) are
auto-mapped to the right preset; the rest become text inputs. A
submit button is always added at the end.

```bash
ng g @ngx-json-forms/primeng:form login --fields=email,password,remember
```

Produces `src/app/forms/login/login.ts`:

```ts
interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

@Component({
  selector: 'app-login',
  imports: [NgxJsonFormComponent, NgxJsonFormDebugComponent, JsonPipe],
  template: \`
    <ngx-json-form [fieldsInput]="fields" (formSubmit)="onSubmit($event)" />
    <ngx-json-form-debug />
    ...
  \`,
})
export class LoginComponent {
  protected readonly fields = defineForm<LoginValues>([
    presets.email({ formControlName: 'email', label: 'Email' }),
    presets.password({ formControlName: 'password', label: 'Password', strong: true }),
    { /* remember toggle */ },
    presets.submit({ formControlName: 'submit', label: 'Submit' }),
  ]);

  protected readonly last = signal<FormEngineEvent | null>(null);

  protected onSubmit(e: FormEngineEvent): void {
    this.last.set(e);
    // TODO: send e.values to your backend.
  }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
```

The schematic also prints a copy-pasteable route snippet you can drop
into `app.routes.ts`.

**Field-name inference:**

| Name pattern                                  | Maps to                                |
|-----------------------------------------------|----------------------------------------|
| `email`, `e-mail`, `*mail`                    | `presets.email(...)` + email validator |
| `password`, `passwd`, `pwd`                   | `presets.password(...)` + strength meter |
| `phone`, `mobile`, `tel`, `whatsapp`, `cell`  | `presets.phone(...)` + tel keyfilter   |
| `*name` (firstName, lastName, name, …)        | `presets.text({ required, minLength: 2 })` |
| `remember*`, `subscribe*`, `accept*`, `agree*`, `enable*`, `optIn*`, `notify*`, `*terms`, `newsletter` | toggle (boolean) |
| `submit`, `save`, `create`, `continue`, `signup`, `signin`, `login`, `register`, `send` | submit button |
| anything else                                 | `presets.text(...)`                    |

**Options:**

```bash
ng g @ngx-json-forms/primeng:form profile \\
  --fields=firstName,lastName,email,phone,subscribe,save \\
  --path=src/app/screens
```

`--fields` defaults to `firstName,lastName,email,submit`. `--path`
defaults to `src/app/forms`. The generator refuses to overwrite an
existing file.

### Build pipeline

Release + CI workflows now also run `nx run primeng:post-build` after
the main build to whitelist `schematics/package.json` in the generated
`.npmignore`. (Without it, `ng add` / `ng g` fail at the consumer with
"exports is not defined in ES module scope" because Node treats the
compiled CommonJS schematic as ESM under the parent package's
`"type": "module"`.)

[1.5.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.5.0

## [1.4.0] — 2026-05-25

### Added — `formFieldsFromJsonSchema(schema)` interop

`@ngx-json-forms/core` now ships an adapter that consumes a standard
JSON Schema (Draft 7 / 2019-09) and returns a `FormField[]` the
renderer can use directly:

```ts
import { formFieldsFromJsonSchema, formSchemaFromJsonSchema } from '@ngx-json-forms/core';

const fields = formFieldsFromJsonSchema(myOpenApiRequestBodySchema);

// or for the full FormSchema (carries title / description):
const schema = formSchemaFromJsonSchema(myJsonSchema);
```

This opens the **"I already have JSON Schema"** market — anyone with
an OpenAPI spec, Ajv contract, or backend-shared JSON Schema can now
render a working Angular form from it in one line. No more
hand-translating each property into `FormField` JSON.

**Mapped JSON Schema features** (covers the common subset):

- `type: 'string'` + every common `format` (`email`, `password`,
  `date`, `date-time`, `time`, `uri`, `tel`) → the right `inputType` +
  HTML `type` + sensible PrimeNG icons + acceptedEvents.
- `enum` on a string → `select` (multi-select when inside an array).
- `type: 'number' | 'integer'` → numeric input with `keyfilter: 'int'`
  when integer.
- `type: 'boolean'` → toggle.
- `type: 'array'` of objects → `repeater` with `itemFields` mapped
  recursively.
- `type: 'object'` → `group` with `groupFields`.
- `required`, `minLength`, `maxLength`, `minimum`, `maximum`,
  `pattern` → `validations.rules`.
- `title`, `description`, `default`, `readOnly`, `examples[0]` →
  `label`, `info`, `value`, `readonly` + `disabled`, `placeholder`.
- `$ref: '#/definitions/...'` / `'#/$defs/...'` resolved in-document.

**Options:**

```ts
formFieldsFromJsonSchema(schema, {
  layoutOverrides: {
    email:     { columnSpan: 8, order: 1 },
    firstName: { columnSpan: 6, order: 2 },
  },
});
```

**Not (yet) supported** — document upfront so users aren't surprised:
`allOf` / `anyOf` / `oneOf`, external `$ref`s, tuple arrays,
`additionalProperties`, `patternProperties`, `dependencies`. For
those, pre-bundle the schema with `json-schema-ref-parser` first.

11 unit tests cover every supported case (run with `nx test core` —
17 tests pass).

[1.4.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.4.0

## [1.3.0] — 2026-05-25

### Added — `ng add @ngx-json-forms/primeng`

The single biggest "first form on screen" friction reducer. A consumer
who's never touched the library now runs **one command** and is ready
to render `<ngx-json-form>`:

```bash
ng add @ngx-json-forms/primeng
```

The schematic:

1. Adds 5 peer dependencies to `package.json`
   (`@angular/animations`, `@primeng/themes`, `primeicons`, `primeng`,
   `quill`).
2. Runs `npm install` (skippable with `--skip-install`).
3. Patches `src/app/app.config.ts` to add the three providers:
   ```ts
   import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
   import { providePrimeNG } from 'primeng/config';
   import Aura from '@primeng/themes/aura';
   import { provideNgxJsonForms } from '@ngx-json-forms/core';

   providers: [
     provideAnimationsAsync(),
     providePrimeNG({ theme: { preset: Aura } }),
     provideNgxJsonForms(),
     // ...your existing providers
   ]
   ```
4. Adds `@import 'primeicons/primeicons.css';` to the project's
   global styles file (`src/styles.css` / `.scss` / `.sass` / `.less`).

Pick a different theme preset with `--theme=material|lara|nora` (default
`aura`). The schematic is idempotent and lenient — if it can't safely
patch a file (for instance: non-standard project structure) it prints
copy-pasteable instructions instead of failing.

Verified end-to-end on a vanilla `ng new` Angular 21 app:
- Tarball installed cleanly
- `ng add` ran the schematic
- All three providers landed in `app.config.ts`
- `primeicons` import landed in `styles.css`
- `ng build --configuration=production` succeeded

### Notes for maintainers

- Schematic source: `packages/primeng/schematics/`
- Compiled to: `packages/primeng/schematics-compiled/` (git-ignored,
  produced by `nx run primeng:build-schematics`)
- Shipped via ng-packagr `assets` into `dist/packages/primeng/schematics/`
- Build order matters — run `nx run primeng:build-schematics` BEFORE
  `nx build primeng`. Using `dependsOn` here pollutes ng-packagr's TS
  context and breaks partial compilation; CI runs them as two sequential
  steps instead (see `.github/workflows/release.yml`).
- `schematics/package.json` ships in the tarball (whitelisted via
  `scripts/fix-npmignore.mjs` because ng-packagr's generated
  `.npmignore` excludes nested package.json files by default). It
  contains only `"type": "commonjs"` so Node resolves the compiled
  schematic as CJS — the parent package is ESM.

[1.3.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.3.0

## [1.2.0] — 2026-05-24

### Added — three Tier-1 enhancements from the roadmap

- **`defineForm<T>()`** (`@ngx-json-forms/core`) — a typed factory that
  narrows `formControlName` to the keys of a TypeScript shape `T`. Mis-
  spelling a control name becomes a compile error instead of a silent
  runtime mismatch. Pure type trick, zero runtime cost (returns the
  same array reference).
  ```ts
  interface Profile { firstName: string; lastName: string; email: string }
  const fields = defineForm<Profile>([
    { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
    { formControlName: 'emial', /* ❌ compile error */ ... },
  ]);
  ```
  Layout / non-form-control fields (\`divider\`, \`staticText\`, \`button\`)
  stay untyped — they don't have to match a key of \`T\`.

- **`<ngx-json-form-debug>`** (`@ngx-json-forms/primeng`) — a drop-in
  devtool panel that shows the live form value, validity, dirty/touched
  status, and per-field errors. Floating bottom-right by default
  (\`[position]="'inline'"\` to embed in flow). Useful while authoring
  schemas; safe to leave out of production.
  ```html
  <ngx-json-form [fieldsInput]="fields()" />
  <ngx-json-form-debug [startOpen]="true" />
  ```

- **Auto-save / restore via \`FormSchema.persistKey\`** — set
  \`persistKey\` on the schema and the renderer auto-binds the form to
  \`FormPersistenceService\` on mount, restoring the previous values
  and saving every subsequent change. Survives page reloads with no
  extra wiring.
  ```ts
  const schema: FormSchema = {
    persistKey: 'profile-form',
    fields: [...],
  };
  <ngx-json-form [schema]="schema" />
  ```
  Default storage is \`localStorage\`; provide a custom
  \`StorageAdapter\` via \`provideFormEngineStorage()\` to back it with
  IndexedDB, sessionStorage, an API, etc.

### Not breaking

Everything in 1.2.0 is purely additive. \`fesm2022\` bundles compatible
with all existing 1.x consumers.

[1.2.0]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.2.0

## [1.1.2] — 2026-05-24

### Changed
- **Package descriptions rewritten** to be search-friendly. The npm
  search index ranks by text-match × popularity × quality; a vague
  one-liner was leaving discoverability points on the table. New
  descriptions name every major feature (validation, conditional
  fields, computed, wizard, repeater, persistence, the supported
  field types) so the text-match score in npm search picks up more
  common queries like "angular form builder", "json schema form",
  "angular dynamic form".
- **Keywords expanded** from 7 → 30 on each package. Adds the terms
  developers actually search for: `angular21`, `form-builder`,
  `dynamic-form`, `json-schema-form`, `schema-driven`,
  `multi-step-form`, `wizard`, `stepper`, `conditional-fields`,
  `form-validation`, etc.

Pure metadata release — `fesm2022` bundles byte-identical to 1.1.1.
Note: npm search is heavily popularity-weighted, so keyword changes
alone won't immediately bring the package to page 1 of search
results. The keywords help once real downloads accumulate.

[1.1.2]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.1.2

## [1.1.1] — 2026-05-24

### Added
- **"Open in StackBlitz" badge** on both package READMEs, plus a new
  `/stackblitz/` starter app in the repo. One click → fork a ready-made
  Angular 21 workspace with all six form scenarios pre-wired; edit any
  field def and the form re-renders instantly. Lowers the
  "let me try the library" barrier from "scaffold an Angular app +
  install 5 peer deps + wire 3 providers" to "click button".
- Documentation-only release; no code changes. fesm2022 bundles identical to 1.1.0.

[1.1.1]: https://github.com/Raghav-Pal-dev/ngx-json-forms/releases/tag/v1.1.1

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
