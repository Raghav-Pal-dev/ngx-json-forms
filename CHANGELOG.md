# Changelog

All notable changes to this project will be documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.20.2] — 2026-05-31

### Fixed

- **Consumer build failure under Vite `optimizeDeps`.** The
  `<ngx-json-form-debug>` component template used a parenthesised arrow
  function (`open.update((v) => !v)`) which Angular's JIT template parser
  rejected when the published `.mjs` was pre-bundled by Vite in some
  consumer setups (e.g. Angular 21 `ng serve`), producing
  `Parser Error: Missing expected )`. Refactored to `open.set(!open())`.
  The library's own demo bypassed this path via Nx source imports, which
  is why the bug only surfaced in real installs.

## [1.20.1] — 2026-05-29

Docs-only release (no code changes).

- Rebuilt the package READMEs (the npm landing pages) with a clearer value
  proposition (why / how to use), an attractive PrimeNG-flavoured layout with
  badges, a grouped field catalog, and prominent **live demo** + **StackBlitz**
  links.
- The live demo + StackBlitz playground now showcase **every** field type with a
  live preview, copy-paste config, and one-click "Open in StackBlitz".

## [1.20.0] — 2026-05-29

A polish + bug-fix release from a full real-consumer audit of every field
type. No breaking changes.

### Fixed

- **Multi-form computed fields.** `FormEngineService` subscriptions are now
  scoped per `FormGroup`. Previously, rendering a second form on the same page
  (e.g. an `<ngx-json-form-stepper>` next to a normal `<ngx-json-form>`) tore
  down the first form's computed-field subscriptions, silently freezing its
  computed values. Each form now disposes only its own subscriptions.
- **Placeholders.** Resolved from either `field.placeholder` **or**
  `field.config.attributes.placeholder` for every field type (previously
  some types only read one location); styled with PrimeNG's own
  `--p-form-field-placeholder-color` token instead of full text color, so a
  placeholder no longer looks like entered text.
- **Unified focus state.** All fields now focus with one color (the theme
  primary, via PrimeNG's focus tokens) and one design. Removed a hardcoded
  blue ring and stray inner rings that made text inputs, password, and native
  widgets (select/autocomplete/phone) focus in three different colors.
- **Select / MultiSelect.** Stripped the host element's duplicate border
  (PrimeNG v21 moved it there), eliminating a thick double border; all wrapped
  controls now share a uniform `2.5rem` height.
- **Date / time / month / year / range pickers.** Removed the inner input's
  duplicate border; the date variants now use the inline calendar icon
  (`iconDisplay="input"`), matching the time picker — no more grey trigger box.
- **Autocomplete.** Full-width inside the input group; single border that
  wraps the dropdown chevron; transparent trigger matching select; built-in
  client-side filtering for static `suggestions` arrays; fixed a loader that
  could stick on after repeated dropdown clicks.
- **phone (intl).** Restored the country-select border and matched the
  standard `2.5rem` field height.
- **File upload.** Basic upload preview thumbnail now renders; drag-and-drop
  no longer rejects valid files when `accept` is `*/*`, and auto-uploads on
  drop.
- **confirmPassword** now renders full-width with the same chrome as
  `password`. **Checkbox** defaults to binary (boolean) mode. **Repeater**
  delete button is vertically aligned with its row inputs.

### Changed / Added

- `optionGroupChildren` now accepts `string | string[]` — the array form is
  required by multi-level `dependentDropdown` (`<p-cascadeselect>`).
- Repeater gained an `addIcon` attribute (default `pi pi-plus`) so the
  add-row button icon is configurable.

## [1.19.0] — 2026-05-25

### Added — `code` field type + `<ngx-code-editor>` + `presets.code()`

Code editor with syntax highlighting (CodeMirror 6). Use for JSON
config fields, regex playgrounds, query builders, prompt templates,
email-template authoring — anywhere users edit code-like text.

Built-in language support:
- `'javascript'`, `'json'`, `'html'`, `'css'`, `'markdown'`, `'text'`

For other languages (Python, SQL, Rust, …) register a custom
renderer via `FieldRegistry.registerRenderer('code', ...)`. We
don't carry the surface area of every CM6 language package.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ name: string; config: string; template: string }>([
  presets.text({ formControlName: 'name', label: 'Config name', required: true }),

  presets.code({
    formControlName: 'config',
    label: 'JSON config',
    language: 'json',
    height: '14rem',
    required: true,
  }),

  presets.code({
    formControlName: 'template',
    label: 'Email template (HTML)',
    language: 'html',
    height: '16rem',
  }),
]);
```

**CodeMirror 6 packages are OPTIONAL peer deps.** Each
`await import('@codemirror/lang-…')` is its own code-split point so
the consumer's app gets exactly one chunk per language they use.
Consumers who never use the `code` field pay zero load cost.

Install to enable:
```bash
npm install @codemirror/state @codemirror/view \\
  @codemirror/language @codemirror/commands \\
  @codemirror/lang-json @codemirror/lang-javascript \\
  @codemirror/lang-html @codemirror/lang-css \\
  @codemirror/lang-markdown
```

(You only need the `@codemirror/lang-<name>` packages for the
languages you actually configure. Skipping a language pack and then
selecting that language renders without highlighting — graceful
degradation.)

Without **any** CM6 deps, the field falls back to a styled
`<textarea>` with monospace font and an install hint.

**Options on `presets.code(...)`:**

| Option            | Default    | Description                                            |
|-------------------|------------|--------------------------------------------------------|
| `formControlName` | —          | Required.                                              |
| `label`           | —          | Field label.                                           |
| `language`        | `'text'`   | One of the built-in languages above.                   |
| `height`          | `'12rem'`  | CSS min-height for the editor container.               |
| `readonly`        | `false`    | Render as view-only (no edits).                        |
| `required`        | `false`    | Whether the field is required.                         |
| `columnSpan`      | `12`       | PrimeFlex column span.                                 |

**Editor capabilities (built-in extensions):**
- Line numbers + active-line gutter highlight
- Active-line highlight
- Multi-cursor / proper selection drawing
- Undo/redo history with the standard keybindings
- Bracket matching + auto-indent on input
- Syntax highlighting via CM6's default highlight style

Live demo: `/code` route in the StackBlitz playground.

This completes the Tier 2 field-type catalogue (10 new field types
in 14 minor releases since 1.5.0: otp, currency, tagInput,
dateRange, signature, address, dragUpload, treeSelect, timeSlots,
markdown, captcha, imageCrop, phoneIntl, code).

---

## [1.18.0] — 2026-05-25

### Added — `phoneIntl` field type + `<ngx-phone-input>` + `presets.phoneIntl()`

Internationalised phone input with country flag dropdown and
format-as-you-type number entry. Form value is a canonical
**E.164** string (e.g. `+14155551234`) — what backends almost
always want. Consumers needing the rich parse output (country,
national, type, etc.) can call `parsePhoneNumber(value)` from
`libphonenumber-js` themselves.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ mobile: string; whatsapp: string }>([
  presets.phoneIntl({
    formControlName: 'mobile',
    label: 'Mobile',
    required: true,
  }),
  presets.phoneIntl({
    formControlName: 'whatsapp',
    defaultCountry: 'IN',   // ISO 3166-1 alpha-2
  }),
]);
```

The existing `presets.phone(...)` is **still here** — it's the
lighter "digits-only + tel keyfilter" preset for forms that don't
need international handling. Use `phoneIntl` when you need country
selection, format-as-you-type, or guaranteed E.164 output;
`phone` when you just want a tel input with a pattern.

**`libphonenumber-js` is now an OPTIONAL peer dep** (~145 KB) of
`@ngx-json-forms/primeng`. The component dynamic-imports it on
first init, so consumers who never use this field pay zero load
cost. Without the dep, the field falls back to a plain E.164 text
input with an install hint — values still bind / submit.

To enable formatted input + validation:
```bash
npm install libphonenumber-js
```

**Options on `presets.phoneIntl(...)`:**

| Option            | Default  | Description                                    |
|-------------------|----------|------------------------------------------------|
| `formControlName` | —        | Required.                                      |
| `label`           | —        | Field label.                                   |
| `placeholder`     | —        | Number input placeholder.                      |
| `defaultCountry`  | `'US'`   | ISO 3166-1 alpha-2 code shown when empty.      |
| `required`        | `false`  | Whether the field is required.                 |
| `columnSpan`      | `12`     | PrimeFlex column span.                         |

Built-in validation: the preset ships with an E.164 `pattern`
regex (`^\+[1-9]\d{1,14}$`) so invalid numbers fail validation
even if the library isn't loaded.

**Implementation notes:**
- Pasting a number starting with `+44` auto-switches the country
  dropdown to GB (libphonenumber's `AsYouType.getCountry()`).
- Country list is the full set returned by `getCountries()`
  (~250 countries), sorted by localised display name.
- A curated `COUNTRY_NAMES` lookup gives human-readable labels for
  ~50 common countries; the rest fall back to ISO codes (still
  functional, just less pretty).

Live demo: `/phone-intl` route in the StackBlitz playground.

---

## [1.17.0] — 2026-05-25

### Added — `imageCrop` field type + `<ngx-image-crop>` + `presets.imageCrop()`

Upload-then-crop image input. User picks a file, drags a crop box
at the configured aspect ratio, clicks Apply — form gets a PNG data
URL of the cropped result. Typical use: profile avatars, post cover
images, KYC photos.

Backed by `cropperjs@^1.6` as an OPTIONAL peer dep. The component
dynamic-imports the library + lazy-loads its CSS on first file pick,
so consumers who never use `imageCrop` pay zero load cost. If the
peer is absent, the field shows an "install cropperjs" hint
instead of crashing.

(We pinned cropperjs to v1.6.x rather than v2.x because v2 is a web-
components rewrite with a different API and is still stabilising.
v1 is battle-tested, ~50 KB, and the imperative `getCroppedCanvas`
flow is exactly what a forms library needs.)

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ displayName: string; avatar: string | null; cover: string | null }>([
  presets.text({ formControlName: 'displayName', label: 'Display name', required: true }),

  // Square avatar, 256×256 max output.
  presets.imageCrop({
    formControlName: 'avatar',
    label: 'Avatar',
    aspectRatio: 1,
    maxOutputWidth: 256,
    maxOutputHeight: 256,
    required: true,
  }),

  // 16:9 cover image.
  presets.imageCrop({
    formControlName: 'cover',
    label: 'Cover image',
    aspectRatio: 16 / 9,
    maxOutputWidth: 1920,
    maxOutputHeight: 1080,
  }),
]);
```

**Options on `presets.imageCrop(...)`:**

| Option            | Default      | Description                                   |
|-------------------|--------------|-----------------------------------------------|
| `formControlName` | —            | Required.                                     |
| `label`           | —            | Field label.                                  |
| `aspectRatio`     | `1`          | `1` square, `16/9`, `4/3`, `NaN` for free.    |
| `accept`          | `'image/*'`  | File picker filter.                           |
| `maxOutputWidth`  | `1024`       | Cap on output PNG width in px.                |
| `maxOutputHeight` | `1024`       | Cap on output PNG height in px.               |
| `required`        | `false`      | Whether a cropped image is required.          |
| `columnSpan`      | `12`         | PrimeFlex column span.                        |

**Implementation notes:**
- Cropper CSS loaded once via `<link rel="stylesheet">` (cdn.jsdelivr.net)
  because ng-packagr can't bundle CSS from an optional peer dep at
  build time. Override via your global styles if you need a self-
  hosted copy.
- Apply emits on demand (not on every drag) so we don't burn CPU
  serialising the canvas while the user is still framing the crop.
- Clear resets both the form value and the file input so the user
  can pick the same file again afterwards (browser-native file
  inputs ignore re-picks of the same path).

Install in your consumer to enable:
```bash
npm install cropperjs@^1.6
```

Live demo: `/image-crop` route in the StackBlitz playground.

---

## [1.16.0] — 2026-05-25

### Added — `captcha` field type + `<ngx-captcha>` + `presets.captcha()`

Cloudflare Turnstile wrapper for public-facing forms (signup,
contact, login, lead-gen). Loads the Turnstile script lazily on
first mount — **zero bundle cost**, no new npm dep. The form value
is the verification token (string) which your backend MUST verify
against Cloudflare's `/siteverify` endpoint before trusting the
submission.

Why Turnstile and not hCaptcha or reCAPTCHA:
- Free, no rate limits
- No third-party cookies / no IP logging by default (GDPR-friendly)
- Smaller and faster than reCAPTCHA
- Cloudflare ships public **test sitekeys** so you can dev locally
  without dashboard signup

For consumers who specifically need hCaptcha / reCAPTCHA: register
your own component via `FieldRegistry.registerRenderer('captcha',
YourImpl)`. We pick one default rather than carry the surface area
of three.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ email: string; message: string; captchaToken: string }>([
  presets.email({ formControlName: 'email', label: 'Email', required: true }),
  presets.text({  formControlName: 'message', label: 'Message', required: true, minLength: 10 }),

  // Dev: '1x00000000000000000000AA' always passes.
  // Prod: create a real sitekey at https://dash.cloudflare.com → Turnstile.
  presets.captcha({
    sitekey: '1x00000000000000000000AA',
    action: 'contact',
  }),
  presets.submit({ label: 'Send' }),
]);
```

**Test sitekeys (no setup, no signup):**

| Sitekey                          | Behaviour                       |
|----------------------------------|---------------------------------|
| `1x00000000000000000000AA`       | Always passes (visible widget)  |
| `2x00000000000000000000AB`       | Always fails                    |
| `3x00000000000000000000FF`       | Forces interactive challenge    |

**Options on `presets.captcha(...)`:**

| Option            | Default          | Description                                          |
|-------------------|------------------|------------------------------------------------------|
| `sitekey`         | —                | Required. Turnstile sitekey from CF dashboard.       |
| `formControlName` | `'captchaToken'` | Where the token lands in the form value.             |
| `label`           | —                | Field label above the widget.                        |
| `theme`           | `'auto'`         | `'light' \| 'dark' \| 'auto'` (follows system).      |
| `size`            | `'normal'`       | `'normal' \| 'compact' \| 'flexible'`.               |
| `action`          | —                | Analytics action label (e.g. `'signup'`).            |
| `required`        | `true`           | Whether token is required for valid form.            |
| `columnSpan`      | `12`             | PrimeFlex column span.                               |

**Implementation notes:**
- Script loaded once and shared across all `<ngx-captcha>` instances
  on the page (idempotent `loadTurnstileOnce()` with a module-level
  promise cache).
- On `writeValue(null)` (e.g. `form.reset()`), the widget resets so
  the user has to solve a fresh challenge.
- The widget is removed cleanly on destroy via `turnstile.remove()`.
- If the Turnstile script fails to load (offline / CSP blocks it),
  an inline warning replaces the widget instead of crashing the
  form.

Live demo: `/captcha` route in the StackBlitz playground.

---

## [1.15.0] — 2026-05-25

### Added — `markdown` field type + `<ngx-markdown-editor>` + `presets.markdown()`

Markdown editor with live preview — textarea on one side, rendered
HTML on the other (or either alone, see `layout`). Use for bios,
post bodies, comments, READMEs, anywhere you want users to write
formatted text without the weight of a full rich-text editor.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ title: string; bio: string }>([
  presets.text({ formControlName: 'title', label: 'Title', required: true }),

  presets.markdown({
    formControlName: 'bio',
    label: 'Bio',
    rows: 8,                  // textarea height
    minLength: 10,
    maxLength: 1000,
    required: true,
  }),
]);
```

**`marked` is now an OPTIONAL peer dep** of `@ngx-json-forms/primeng`.
The component dynamic-imports it on first render — consumers who
never touch `markdown` pay zero load cost. Without the dep
installed, the preview pane shows an install hint
(`npm install marked`) instead of crashing. The editor textarea
still functions normally so values still bind / submit.

To enable preview rendering:

```bash
npm install marked
```

**Options on `presets.markdown(...)`:**

| Option            | Default         | Description                                            |
|-------------------|-----------------|--------------------------------------------------------|
| `formControlName` | —               | Required.                                              |
| `label`           | —               | Field label.                                           |
| `placeholder`     | `'Write markdown…'` | Hint inside the textarea.                          |
| `layout`          | `'split'`       | `'split' \| 'editor' \| 'preview'`.                    |
| `rows`            | `8`             | Textarea row count.                                    |
| `minLength`       | —               | Character lower bound.                                 |
| `maxLength`       | —               | Character upper bound.                                 |
| `required`        | `false`         | Whether the field is required.                         |
| `columnSpan`      | `12`            | PrimeFlex column span.                                 |

Security note: the editor doesn't apply additional HTML sanitisation
beyond what `marked` and Angular's `[innerHTML]` provide. For
high-trust contexts where users can paste raw HTML, wire your own
`DOMPurify` step at the consumer level.

Live demo: `/markdown` route in the StackBlitz playground.

---

## [1.14.0] — 2026-05-25

### Added — `timeSlots` field type + `<ngx-time-slots>` + `presets.timeSlots()`

Appointment-style button grid for server-driven time-slot picking
(appointment booking, course scheduling, workshop sign-ups). Renders
a wrap-flex grid of clickable slot buttons; selected ones get the
primary fill.

Slots can be plain `string[]` or the richer `Slot[]` shape so servers
can mark already-booked slots as `disabled: true` without removing
them — the user still sees the time but can't click it.

Value shape:
- `multiple: false` (default) → `string | null` (click-again deselects)
- `multiple: true`            → `string[]`

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ name: string; appointment: string | null }>([
  presets.text({ formControlName: 'name', label: 'Your name', required: true }),

  // Plain string list — single-pick.
  presets.timeSlots({
    formControlName: 'appointment',
    label: 'Pick a time today',
    slots: ['09:00', '09:30', '10:00', '10:30', '11:00'],
    required: true,
  }),

  // Multi-pick, one slot already booked (greyed out).
  presets.timeSlots({
    formControlName: 'workshops',
    multiple: true,
    selectedSeverity: 'success',
    slots: [
      { value: 'mon-9', label: 'Mon 9 AM' },
      { value: 'mon-2', label: 'Mon 2 PM', disabled: true },
      { value: 'tue-9', label: 'Tue 9 AM' },
    ],
  }),
]);
```

**Options on `presets.timeSlots(...)`:**

| Option               | Default              | Description                                          |
|----------------------|----------------------|------------------------------------------------------|
| `formControlName`    | —                    | Required.                                            |
| `slots`              | —                    | Required. `string[]` or `{value, label?, disabled?}[]`. |
| `multiple`           | `false`              | Single vs multi-pick.                                |
| `selectedSeverity`   | `'primary'`          | PrimeNG severity for selected button(s).             |
| `unselectedSeverity` | `'secondary'`        | PrimeNG severity for unselected (outlined).          |
| `emptyMessage`       | `'No slots available'`| Shown when `slots` is empty.                        |
| `required`           | `false`              | Whether at least one slot must be picked.            |
| `columnSpan`         | `12`                 | PrimeFlex column span.                               |

The underlying `<ngx-time-slots>` standalone component is also
exported from `@ngx-json-forms/primeng` (CVA-compliant) so consumers
can use it directly in any reactive form via `formControlName`.

Live demo: `/time-slots` route in the StackBlitz playground.

---

## [1.13.0] — 2026-05-25

### Added — `treeSelect` field type + `presets.treeSelect()`

Hierarchical select widget for nested taxonomies — categories,
org charts, file trees, permission grids. Three selection modes,
each producing a different value shape:

| Mode         | Value shape                                                  |
|--------------|--------------------------------------------------------------|
| `'single'`   | `TreeNode \| null`                                           |
| `'multiple'` | `TreeNode[]`                                                 |
| `'checkbox'` | `{ [key: string]: { checked, partialChecked } }`             |

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

const orgChart = [
  { key: '1', label: 'Engineering', children: [
    { key: '1-0', label: 'Frontend', children: [
      { key: '1-0-0', label: 'Web' },
      { key: '1-0-1', label: 'Mobile' },
    ]},
    { key: '1-1', label: 'Backend' },
  ]},
  { key: '2', label: 'Sales' },
];

defineForm<{ employee: string; department: unknown; permissions: unknown }>([
  presets.text({ formControlName: 'employee', label: 'Employee', required: true }),

  // Single-select.
  presets.treeSelect({
    formControlName: 'department',
    label: 'Department',
    nodes: orgChart,
    required: true,
  }),

  // Multiple + filter + chip display.
  presets.treeSelect({
    formControlName: 'regions',
    nodes: orgChart,
    mode: 'multiple',
    display: 'chip',
    filter: true,
  }),

  // Checkbox tree with auto-propagation up + down (default).
  presets.treeSelect({
    formControlName: 'permissions',
    nodes: permissionsTree,
    mode: 'checkbox',
  }),
]);
```

**Options on `presets.treeSelect(...)`:**

| Option                   | Default     | Description                                            |
|--------------------------|-------------|--------------------------------------------------------|
| `formControlName`        | —           | Required.                                              |
| `nodes`                  | —           | Required. `TreeNode[]` (`{ key, label, children? }`).  |
| `mode`                   | `'single'`  | `'single' \| 'multiple' \| 'checkbox'`.                |
| `label`                  | —           | Field label.                                           |
| `placeholder`            | `'Select'`  | Trigger placeholder text.                              |
| `filter`                 | `false`     | Show a search box above the tree.                      |
| `filterBy`               | `'label'`   | Field to filter on.                                    |
| `filterPlaceholder`      | `'Search'`  | Search-box placeholder.                                |
| `showClear`              | `false`     | Show a clear (X) button on the trigger.                |
| `propagateSelectionDown` | `true`      | Checkbox mode: select children when parent selected.   |
| `propagateSelectionUp`   | `true`      | Checkbox mode: select parent when all children selected.|
| `display`                | `'comma'`   | Multi-mode value display: `'comma'` or `'chip'`.       |
| `scrollHeight`           | `'300px'`   | Max overlay height.                                    |
| `emptyMessage`           | `'No options'` | Shown when the tree is empty / filter has no hits.   |
| `required`               | `false`     | Whether at least one selection is required.            |
| `columnSpan`             | `12`        | PrimeFlex column span.                                 |

Reuses PrimeNG's `<p-treeSelect>` (already a peer dep) — no new
dependencies. Live demo: `/tree-select` route in StackBlitz.

---

## [1.12.0] — 2026-05-25

### Added — `dragUpload` field type + `presets.dragUpload()`

A proper drag-and-drop file zone — drop targets, file queue with
per-file remove buttons, Upload / Cancel actions, the works.
Existing `fileUpload` (button-only with image preview list) stays
exactly as it was — `dragUpload` is a separate, additive renderer
so nothing breaks for current consumers.

Wraps `<p-fileUpload mode="advanced" customUpload>`, so the
`uploadHandler` event fires with `{ files: File[] }` — wire it
into your `(formChange)` handler and POST the files yourself
(no upload URL needed in the engine itself).

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ title: string; attachments: unknown; avatar: unknown }>([
  presets.text({ formControlName: 'title', label: 'Title', required: true }),

  // Default: multi-file, any type, 5 MB cap per file.
  presets.dragUpload({ formControlName: 'attachments', label: 'Attachments' }),

  // Avatar — single image, 2 MB cap, auto-upload on pick.
  presets.dragUpload({
    formControlName: 'avatar',
    label: 'Avatar',
    accept: 'image/*',
    multiple: false,
    maxFileSize: 2 * 1024 * 1024,
    auto: true,
  }),

  // PDF-only, 5 files max, French labels (i18n example).
  presets.dragUpload({
    formControlName: 'docs',
    accept: '.pdf',
    fileLimit: 5,
    chooseLabel: 'Sélectionner',
    uploadLabel: 'Téléverser',
    cancelLabel: 'Annuler',
    dragDropLabel: 'Glissez-déposez vos fichiers ici',
  }),
]);
```

**Options on `presets.dragUpload(...)`:**

| Option              | Default                       | Description                                  |
|---------------------|-------------------------------|----------------------------------------------|
| `formControlName`   | —                             | Required.                                    |
| `label`             | —                             | Field label.                                 |
| `multiple`          | `true`                        | Allow multi-file selection.                  |
| `accept`            | all files                     | MIME / extension allowlist (e.g. `image/*`). |
| `maxFileSize`       | `5 * 1024 * 1024` (5 MB)      | Per-file size cap in bytes.                  |
| `fileLimit`         | `0`                           | Max number of files; `0` = unlimited.        |
| `auto`              | `false`                       | Auto-upload on file selection.               |
| `chooseLabel`       | `'Choose'`                    | Button label.                                |
| `uploadLabel`       | `'Upload'`                    | Button label.                                |
| `cancelLabel`       | `'Cancel'`                    | Button label.                                |
| `dragDropLabel`     | `'Drag and drop files here…'` | Empty-state message inside the drop zone.    |
| `chooseIcon`        | `'pi pi-folder-open'`         | Choose-button icon.                          |
| `required`          | `false`                       | Whether at least one file is required.       |
| `columnSpan`        | `12`                          | PrimeFlex column span.                       |

The empty-state UI (cloud icon + instructional text) is styled via
the new `.ngx-drag-empty` / `.ngx-drag-icon` classes — override
them in your global CSS if you want a different look.

Live demo: `/drag-upload` route in the StackBlitz playground.

---

## [1.11.0] — 2026-05-25

### Added — `presets.address()` composite field

Scaffolds a nested `group` with six sub-fields (line1, line2, city,
state, postalCode, country), each pre-wired with sensible labels,
column-span layout, and validation. Country defaults to a select
backed by a curated list of common destinations; pass your own list
or `countries: []` for a free-form text input.

No new InputType, no new renderer — `address` is a configured
`group`, so anything that already works for `group` continues to
work.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ fullName: string; shipping: {
  line1: string; line2: string; city: string; state: string;
  postalCode: string; country: string;
} }>([
  presets.text({ formControlName: 'fullName', label: 'Full name', required: true }),

  // Default: all 6 sub-fields, curated country list.
  presets.address({ formControlName: 'shipping', label: 'Shipping address' }),

  // Billing — skip line2 + state, restrict to India only.
  presets.address({
    formControlName: 'billing',
    label: 'Billing address',
    include: { line2: false, state: false },
    countries: [{ label: 'India', value: 'IN' }],
  }),

  // Free-form country — pass [] to render text input instead of select.
  presets.address({
    formControlName: 'other',
    countries: [],
    required: { postalCode: false },
  }),
]);
```

**Options on `presets.address(...)`:**

| Option            | Default                                     | Description                                  |
|-------------------|---------------------------------------------|----------------------------------------------|
| `formControlName` | —                                           | Required.                                    |
| `label`           | —                                           | Group label.                                 |
| `include`         | all 6 sub-fields                            | Selectively hide sub-fields.                 |
| `required`        | all required except `line2`                 | Per-field required overrides.                |
| `countries`       | US, CA, GB, AU, NZ, IN, DE, FR, ES, IT, JP, BR, MX, SG | Custom list of `{label, value}` or `[]` for text input. |
| `columnSpan`      | `12`                                        | PrimeFlex column span for the whole group.   |

**Postal-code validation:** the built-in `pattern` is intentionally
permissive — it accepts US ZIP (5 or 5-4), Canadian (A1A 1A1),
UK (SW1A 1AA), Indian (110001), and most other common formats.
Tighten per-country in your own validator if you need strict matching.

The form value shape is a nested object:
```ts
{
  shipping: {
    line1: '123 Main St',
    line2: 'Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    country: 'US',   // ISO 3166-1 alpha-2 from the default list
  }
}
```

Live demo: `/address` route in the StackBlitz playground.

---

## [1.10.0] — 2026-05-25

### Added — `signature` field type + `<ngx-signature-pad>` + `presets.signature()`

Canvas-backed signature pad for consent forms, waivers, delivery
receipts, approval workflows. The form value is a PNG data URL
(`data:image/png;base64,...`) while there's a signature; `null` when
empty. Drop it into `<img [src]="value">` to render, POST it as-is
to your backend, or persist in JSON.

```ts
import { presets, defineForm } from '@ngx-json-forms/core';

defineForm<{ fullName: string; consent: string | null }>([
  presets.text({ formControlName: 'fullName', label: 'Full name', required: true }),
  presets.signature({
    formControlName: 'consent',
    label: 'I agree (sign below)',
    required: true,
  }),
  presets.signature({
    formControlName: 'approval',
    label: 'Manager approval',
    penColor: '#1d4ed8',
    penWidth: 3,
    height: 220,
  }),
]);
```

**Options on `presets.signature(...)`:**

| Option            | Default     | Description                                       |
|-------------------|-------------|---------------------------------------------------|
| `formControlName` | —           | Required.                                         |
| `label`           | —           | Field label.                                      |
| `penColor`        | `'#111827'` | CSS color string (`'#1d4ed8'`, `'red'`, …).       |
| `penWidth`        | `2`         | Line width in CSS pixels.                         |
| `height`          | `180`       | Canvas height in CSS pixels (width is responsive).|
| `hideClearButton` | `false`     | Hide the built-in Clear button.                   |
| `clearLabel`      | `'Clear'`   | Label on the Clear button.                        |
| `required`        | `false`     | Whether a signature is required.                  |
| `columnSpan`      | `12`        | PrimeFlex column span.                            |

The underlying `<ngx-signature-pad>` standalone component is also
exported from `@ngx-json-forms/primeng` so you can use it directly
in non-engine contexts (any reactive form via `formControlName`).

Implementation notes:
- Pointer events (not mouse) → touch + stylus + mouse work without
  three sets of listeners. `touch-action: none` on the canvas
  prevents the page scrolling while signing.
- HiDPI / retina sharp: the canvas backing-store is sized to
  `cssWidth × devicePixelRatio`. A `ResizeObserver` resamples on
  container resize and preserves the signature across the resize.
- Emits to the form on stroke-end (`pointerup`), not on every
  pointer-move — avoids burning CPU serialising the canvas 60×/sec
  mid-signature.

Live demo: `/signature` route in the StackBlitz playground.

---

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
