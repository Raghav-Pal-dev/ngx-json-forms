<div align="center">

# @ngx-json-forms/primeng

### Drop in `<ngx-json-form>`, pass a JSON config, get a fully-validated, reactive **PrimeNG** form. 40+ field types. Zero template markup.

[![npm version](https://img.shields.io/npm/v/@ngx-json-forms/primeng?color=10b981&label=npm)](https://www.npmjs.com/package/@ngx-json-forms/primeng)
[![downloads](https://img.shields.io/npm/dm/@ngx-json-forms/primeng?color=2563eb)](https://www.npmjs.com/package/@ngx-json-forms/primeng)
[![license](https://img.shields.io/npm/l/@ngx-json-forms/primeng?color=64748b)](https://github.com/Raghav-Pal-dev/ngx-json-forms/blob/main/LICENSE)
[![Angular](https://img.shields.io/badge/Angular-%E2%89%A519-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-%E2%89%A519-10b981)](https://primeng.org)

**[🖥 Live demo](https://raghav-pal-dev.github.io/ngx-json-forms/)** &nbsp;·&nbsp;
**[⚡ Try on StackBlitz](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts)** &nbsp;·&nbsp;
**[📦 Source](https://github.com/Raghav-Pal-dev/ngx-json-forms)**

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

The **PrimeNG renderer** for [`@ngx-json-forms/core`](https://www.npmjs.com/package/@ngx-json-forms/core).
Describe your fields as a JSON array, drop in `<ngx-json-form>`, and get a complete
PrimeNG form — inputs, labels, validation messages, responsive 12-column layout — with
**no template markup to write or maintain**.

```html
<ngx-json-form [fieldsInput]="fields" (formSubmit)="save($event)" />
```

## Why use it?

- **Describe, don't build.** One `FormField[]` array becomes a full PrimeNG form. Add,
  reorder or gate a field by editing data — not template + TS + validators in three places.
- **40+ field types out of the box** — text, select, multiselect, autocomplete, cascade,
  date/time/month/year, currency, OTP, rating, slider, file upload, drag-drop, image crop,
  signature, rich text, markdown, code editor, captcha, phone (intl), tag input, tree
  select, time slots, address, repeaters, wizards… all themed and validated.
- **It just looks right.** Native PrimeNG controls, one consistent focus color, uniform
  field heights, muted placeholders — tracks your PrimeNG theme's primary color.
- **Validation + UX handled.** Required/min/max/pattern/email/cross-field/async validators,
  inline error messages, conditional `showWhen`, computed fields, auto-save.
- **Light footprint.** Heavy field deps (quill, cropperjs, codemirror, libphonenumber-js,
  marked) are **optional peers**, dynamically imported only when you actually use that field.

## Try it before you install

| | |
|---|---|
| 🖥 **Live demo** | [raghav-pal-dev.github.io/ngx-json-forms](https://raghav-pal-dev.github.io/ngx-json-forms/) — every field with a live preview + copy-paste config |
| ⚡ **StackBlitz** | [fork the playground](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts) — edit `catalog.ts`, watch the form re-render instantly. No install. |

## Install — one command

```bash
ng add @ngx-json-forms/primeng
```

This installs both packages + PrimeNG + the Aura theme + primeicons +
`@angular/animations`, wires `provideNgxJsonFormsPrimeng()` into your
`app.config.ts`, and adds the primeicons import to `styles.scss`.
Requires Angular ≥ 21.2 — older versions ERESOLVE at install time
with a clear message so you know to upgrade.

Optional peers — install only for the fields you use:
`marked` (markdown), `cropperjs` (imageCrop), `libphonenumber-js` (phoneIntl),
`quill` (rich-text editor), `@codemirror/*` (code editor).

<details>
<summary>Manual install instead of <code>ng add</code></summary>

```bash
npm install @ngx-json-forms/core @ngx-json-forms/primeng \
            primeng @primeng/themes primeicons @angular/animations \
            --legacy-peer-deps
```

…then wire the providers yourself (see *Wire-up* below).
</details>

## Wire-up — one line

If you used `ng add @ngx-json-forms/primeng`, this is already done. Otherwise:

`app.config.ts`:

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

`styles.css`:

```css
@import 'primeicons/primeicons.css';
```

### Custom theme

`provideNgxJsonFormsPrimeng()` uses the **Aura** preset by default. Override it:

```ts
import Nora from '@primeng/themes/nora';

providers: [
  provideNgxJsonFormsPrimeng({ theme: Nora }),
]
```

Or pass a full PrimeNG config object via `primengConfig` for ripple, CSP, etc.

## Try it — paste this into `app.ts`

A single `FormField[]` that exercises every major feature: all four
validation rules (`required` / `minLength` / `maxLength` / `pattern`)
with custom error messages, the v1.21 `inputType` aliases (`email`,
`number`), conditional `showWhen`, the **`visible` vs `isHidden`**
distinction, `acceptedEvents` wiring, icons + info hints, and the
`layout` grid (`columnSpan` + `order`).

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
    /* ── All four validation rules on one field, with custom messages ──
       required, minLength, maxLength, pattern — error text auto-renders
       below the input. `acceptedEvents` lists which DOM events bubble
       up to (formChange) — omit it and nothing fires.                 */
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

    /* ── v1.21 alias: inputType: 'email' renders <input type="email"> ── */
    {
      formControlName: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      config: { attributes: { inputType: 'email', fieldIcon: 'pi pi-envelope' } },
      validations: { rules: { required: true, email: true } },
      layout: { columnSpan: 6, order: 2 },
    },

    /* ── 'number' alias + min/max range validators ─────────────────── */
    {
      formControlName: 'age',
      label: 'Age',
      config: { attributes: { inputType: 'number' } },
      validations: { rules: { required: true, min: 13, max: 120 } },
      layout: { columnSpan: 4, order: 3 },
    },

    /* ── Select with options + info hint underneath ─────────────────── */
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

    /* ── Conditional: city only rendered when country === 'IN' ──────── */
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
       `visible: false`  → field is NOT BUILT. No FormControl, no DOM,
                           validations never fire. Use for role-based
                           hiding ("admin-only field").

       `isHidden: true`  → field IS built (FormControl exists, validates,
                           appears in submit payload) but rendered with
                           `display: none`. Use for hidden tokens or
                           computed values you still want submitted.

       Two examples below — submit and inspect the JSON to see which one
       made it into the payload (csrfToken yes; adminOnly no).           */
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
          value: 'auto-' + Math.random().toString(36).slice(2, 10),
        },
      },
      validations: { rules: { required: true } },   // STILL VALIDATES
      layout: { columnSpan: 12, order: 7 },
    },

    /* ── Textarea + maxLength validator ──────────────────────────────── */
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

No `<input>`, no `[formGroup]`, no validation templates. For shorter
field definitions use the [`presets.*` factories](https://github.com/Raghav-Pal-dev/ngx-json-forms#preset-field-factories)
in `@ngx-json-forms/core`; for every supported `inputType` and live
copy-paste config, see the
[live demo](https://raghav-pal-dev.github.io/ngx-json-forms/).

## Field catalog

| Group | `inputType`s |
|---|---|
| **Text** | `text`, `password`, `confirmPassword`, `textarea`, `email`, `phone` |
| **Choice** | `select`, `multiSelect`, `autocomplete`, `dependentDropdown` (cascade), `radio`, `checkbox`, `toggle`, `colorPicker`, `treeSelect` |
| **Numbers** | `number`, `currency`, `rating`, `slider`, `otp` |
| **Date & time** | `datePicker`, `time`, `month`, `year`, date range, `timeSlots` |
| **Files & media** | `fileUpload`, `dragUpload`, `imageCrop`, `signature` |
| **Specialised** | `tagInput`, `phoneIntl`, `markdown`, `editor` (Quill), `code` (CodeMirror), `captcha` (Turnstile) |
| **Composite** | `group` (nested), `repeater` (FormArray), `address` |
| **Layout** | `staticText`, `divider`, `button` |

Plus any custom component registered via `FieldRegistry.registerRenderer()`.

## Multi-step wizard

```html
<ngx-json-form-stepper
  [schema]="schema"
  submitLabel="Create account"
  (formSubmit)="handleSubmit($event)" />
```

`schema` is a `FormSchema` with `steps: FormStep[]` — per-step validation, progress
indicator and (optional) `persistKey` auto-save included.

## Live debug panel

```html
<ngx-json-form-debug position="floating" />
```

A floating inspector showing the live form value + validity — handy while building.

## Documentation

Browse the **[live demo](https://raghav-pal-dev.github.io/ngx-json-forms/)** for an
interactive preview + copy-paste config of every field, or open the
**[StackBlitz playground](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz?file=src/app/catalog.ts)**
to edit and run them in your browser.

## License

MIT © [Raghvendrasing Pal](https://github.com/Raghav-Pal-dev)
