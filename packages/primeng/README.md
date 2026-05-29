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

## Install

```bash
npm i @ngx-json-forms/core @ngx-json-forms/primeng \
      primeng @primeng/themes primeicons @angular/animations
```

Optional peers — install only for the fields you use:
`marked` (markdown), `cropperjs` (imageCrop), `libphonenumber-js` (phoneIntl),
`quill` (rich-text editor), `@codemirror/*` (code editor).

## Wire-up

`app.config.ts`:

```ts
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura } }),
  ],
};
```

`styles.css`:

```css
@import 'primeicons/primeicons.css';
```

## Quick start

```ts
import { Component, signal } from '@angular/core';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

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
    presets.text({  formControlName: 'firstName', label: 'First name', required: true, columnSpan: 6 }),
    presets.email({ formControlName: 'email',     label: 'Email',                      columnSpan: 6 }),
    presets.password({ formControlName: 'password', label: 'Password', strong: true,   columnSpan: 12 }),
    presets.submit({ formControlName: 'save', label: 'Create account', columnSpan: 4 }),
  ]);

  onSubmit(e: FormEngineEvent) { console.log('submit', e.values); }
  onChange(e: FormEngineEvent) { /* live value on every change */ }
}
```

That's it — no `<input>`, no `[formGroup]`, no validation templates. The presets cover the
common fields; for everything else write the field config directly (see the
[live demo](https://raghav-pal-dev.github.io/ngx-json-forms/) for every `inputType`).

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
