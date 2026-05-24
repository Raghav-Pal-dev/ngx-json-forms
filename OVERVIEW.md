# ngx-json-forms — Overview & Test Plan

A complete one-pager for testers and reviewers. Read sections 1–3 to understand
the product, then use sections 4–6 to run the test pass.

---

## 1. What is ngx-json-forms?

`ngx-json-forms` is an **Angular 21 form engine driven entirely by a JSON
config**. You hand it an array of field definitions and it gives you back a
fully reactive form: rendering, validation, layout, conditional logic,
repeaters, wizards, file upload, the lot. The host app writes no template
markup for fields.

### Two packages

| Package | Purpose |
|---|---|
| `@ngx-json-forms/core` | Pure-Angular brain: types, `FormEngineService`, registries, persistence, validation engine. **Zero UI dependencies.** |
| `@ngx-json-forms/primeng` | PrimeNG renderer (`<ngx-json-form>`) + wizard wrapper (`<ngx-json-form-stepper>`). |

### How it flows

```
JSON FormField[]  ──►  FormEngineService.buildFormGroup()  ──►  Angular FormGroup
                                                                       │
                                                                       ▼
                       <ngx-json-form>  ◄────────────────────  PrimeNG renderer
                            │  emits formChange / formSubmit
                            ▼
                          host app
```

Anywhere in the app you can also inject `FormEngineService` and drive the form
imperatively: `setValue`, `patchValue`, `addArrayItem`, `nextStep`,
`updateFieldAttributes`, etc.

### Supported `inputType` values

`text`, `password`, `confirmPassword`, `number`, `email`, `textarea`,
`editor` (Quill rich text), `select`, `multiSelect`, `autocomplete`,
`dependentDropdown` (cascading), `datePicker`, `time`, `month`, `year`,
`toggle` (optional card layout), `checkbox`, `radio`, `fileUpload` (base64
preview), `slider`, `rating`, `colorPicker`, `staticText`, `divider`,
`button`, `repeater` (FormArray), `group` (nested FormGroup), or any
**custom component** registered through `FieldRegistry.registerRenderer()`.

---

## 2. Run it locally

```bash
cd /Users/raghav/Raghav/ngx-json-forms
npm install          # if you haven't already
npx nx serve demo    # http://localhost:4200
```

Other useful targets:

```bash
npx nx build core       # build the core package
npx nx build primeng    # build the PrimeNG adapter
npx nx build demo       # production build of the demo
npx nx run-many --target=test --all   # run unit tests
```

---

## 3. The demo app at a glance

When the demo loads at <http://localhost:4200> you should see:

| Area | What it does |
|---|---|
| **Top nav** | Static branding + npm / GitHub / docs links |
| **Hero section** | Marketing copy + stat strip ("17 Field Types", etc.) |
| **Features grid** | Six feature cards (JSON-Driven, Signal-First, …) |
| **Demo card** (left) | The actual live form rendered by `<ngx-json-form>`. Tabs: **Live Form** / **JSON Schema**. After a valid submit it flips to a success panel with the payload. |
| **Live Form State** (right) | Real-time JSON dump of the form value + a Valid/Invalid pill that turns green/red. Driven by signals — no event needed. |
| **Live JSON Editor** (right) | A textarea bound to the field array. **Edit JSON → the form re-renders instantly.** This is the tester's main tool for exercising every field type. |
| **How it works / Adapters** | Reference cards (read-only). |
| **Footer** | Static. |

### Pre-loaded fields in the default schema

1. `firstName` — text, required, minLength 2
2. `lastName` — text, required
3. `email` — text/email, required + email validator
4. `country` — filterable select with 8 options, required
5. `role` — select with 6 options, required
6. `skills` — multi-select with chip display, required
7. `experience` — select (optional)
8. `bio` — textarea with auto-resize
9. Divider ("Preferences")
10. `newsletter` — toggle (card layout, default ON)
11. `openSource` — toggle (card layout, default OFF)
12. `fullName` — **computed** field (re-derived from firstName + lastName)
13. `contacts` — **repeater** with `name` + `email` per row
14. `submitBtn` — submit button (disabled while form invalid)

---

## 4. Feature test matrix

Tick each row. Priority: **P1** must pass before sign-off, **P2** should pass,
**P3** nice-to-have. Use Chrome DevTools console for the JS errors row.

### 4.1 Default field types (use the pre-loaded form)

| # | Test | Expected | Priority |
|---|---|---|---|
| F1 | Type 1 character into `firstName` and blur | Error appears: "At least 2 characters" | P1 |
| F2 | Clear `firstName` and blur | Error: "First name is required" | P1 |
| F3 | Enter `not-an-email` in `email` and blur | Error: "Enter a valid email address" | P1 |
| F4 | Open the `country` dropdown, type "ind" | List filters to India | P1 |
| F5 | Pick a country, then click the **clear** (×) icon | Field empties, validation fires again | P2 |
| F6 | Open `skills` multiselect, pick 3 options | Chips render inside the field | P1 |
| F7 | Type ~50 chars into `bio` | Textarea auto-resizes | P2 |
| F8 | Click each toggle card | Switch animates, card border highlights, info text stays visible | P1 |
| F9 | Fill `firstName` and `lastName` | `fullName` field auto-updates as you type | **P1** (new) |
| F10 | In the contacts repeater, type into row 1 fields | Live State JSON shows `"contacts": [{...}]` | **P1** (new) |
| F11 | Click "Add contact" | A new empty row appears | **P1** (new) |
| F12 | Click the trash icon on row 2 | Row 2 is removed | **P1** (new) |
| F13 | Click the trash on the **only** remaining row | Row should **not** be removed (minRows = 1) | P2 |
| F14 | Submit button while form invalid | Button is greyed out / disabled | P1 |
| F15 | Fill everything required, then submit | Form area flips to the green "Profile Created!" panel showing payload | P1 |
| F16 | Inspect the success payload | `fullName` must be **absent** (it's `transient`) | **P2** (new) |
| F17 | Click "Start Over" | Demo resets, form is empty again | P1 |

### 4.2 Live form state panel (right side)

| # | Test | Expected | Priority |
|---|---|---|---|
| S1 | Before touching anything | Right panel shows "Interact with the form to see live state here" | P2 |
| S2 | Type in any field | Pill turns red ("Invalid") and JSON dump appears | P1 |
| S3 | Fix all errors | Pill turns green ("Valid"), progress bar fills | P1 |
| S4 | Toggle a card | Live JSON updates within the same animation frame | P2 |
| S5 | Add a repeater row | `contacts` array length in the JSON increases | P1 |

### 4.3 JSON editor (live schema editing)

| # | Test | Expected | Priority |
|---|---|---|---|
| E1 | Delete the closing `]` to break the JSON | Status pill in the editor turns red "Parse error", error bar shows reason. Form left in last valid state. | P1 |
| E2 | Restore the bracket | Status returns to green "Valid JSON", form re-renders instantly | P1 |
| E3 | Click "Reset" | Editor and form return to defaults | P1 |
| E4 | Paste the **field-type sampler** JSON from §5.1 below | Every field type renders without errors | P1 |
| E5 | Paste the **showWhen** JSON from §5.2 | The dependent field appears/disappears as you toggle the controller | P1 |
| E6 | Paste the **repeater min/max** JSON from §5.3 | Add disabled at `maxRows`, remove disabled at `minRows` | P2 |
| E7 | Paste invalid `inputType: "foobar"` | Field renders nothing, no console crash | P2 |

### 4.4 Wizard / Stepper (use the JSON below)

The stepper is wired up but the demo does not show it by default. Build a quick
test page or temporarily swap `<ngx-json-form>` for `<ngx-json-form-stepper>` in
[apps/demo/src/app/app.html](apps/demo/src/app/app.html). Schema in §5.4.

| # | Test | Expected | Priority |
|---|---|---|---|
| W1 | Page loads | Step bar shows 3 steps, step 1 highlighted | P1 |
| W2 | Click "Next" with step-1 fields empty | Required errors appear, stepper does **not** advance | P1 |
| W3 | Fill step 1, click "Next" | Advances to step 2, step 1 shows ✓ check | P1 |
| W4 | Click "Back" | Returns to step 1, values preserved | P1 |
| W5 | Click step 1 indicator while on step 2 | Jumps back to step 1 | P2 |
| W6 | Click step 3 indicator while on step 1 | Does **not** jump forward (only completed steps are clickable) | P2 |
| W7 | Reach last step → click "Submit" | `formSubmit` fires with the merged payload | P1 |

### 4.5 Computed / Persistence / Registries (advanced)

| # | Test | Expected | Priority |
|---|---|---|---|
| C1 | Edit `firstName` letter-by-letter | `fullName` updates within the same tick (no flicker) | **P1** |
| C2 | Manually try to focus `fullName` and type | Should be **read-only** (disabled because `computed`) | P2 |
| C3 | Open DevTools → Application → Local Storage | No `ngxJsonForms:*` key unless persistence is bound (default demo does not bind) | P3 |

### 4.6 Cross-cutting

| # | Test | Expected | Priority |
|---|---|---|---|
| X1 | Open DevTools console after page load | **No** red errors or warnings tied to the library | P1 |
| X2 | Resize browser below 640 px | All columns collapse to full width (mobile rule in SCSS) | P1 |
| X3 | Keyboard-only: Tab through every field | Focus ring visible, order matches `tabIndex`/visual order | P1 |
| X4 | Screen reader (VoiceOver / NVDA) on each control | Label is announced; errors announced via `aria-describedby` | P2 |
| X5 | Build production bundle: `npx nx build demo` | Succeeds, bundle reported around ~1.17 MB raw / ~250 kB gzip | P2 |
| X6 | Lighthouse run on the prod build | Performance ≥ 90, A11y ≥ 95 | P3 |

---

## 5. Ready-to-paste JSON for the right-side editor

Copy each block, paste it into the **Live JSON Editor** textarea, and verify
behaviour.

### 5.1 Field-type sampler

```json
[
  { "formControlName": "txt",   "label": "Text",        "config": { "attributes": { "inputType": "text", "acceptedEvents": ["change"] } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "pwd",   "label": "Password",    "config": { "attributes": { "inputType": "password", "feedback": true, "toggleMask": true } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "ta",    "label": "Textarea",    "config": { "attributes": { "inputType": "textarea", "rows": 3, "autoResize": true } }, "layout": { "columnSpan": 12 } },
  { "formControlName": "ed",    "label": "Rich Editor", "config": { "attributes": { "inputType": "editor" } }, "layout": { "columnSpan": 12 } },
  { "formControlName": "dt",    "label": "Date",        "config": { "attributes": { "inputType": "datePicker", "showIcon": true } }, "layout": { "columnSpan": 4 } },
  { "formControlName": "tm",    "label": "Time",        "config": { "attributes": { "inputType": "time", "hourFormat": "12" } }, "layout": { "columnSpan": 4 } },
  { "formControlName": "yr",    "label": "Year",        "config": { "attributes": { "inputType": "year" } }, "layout": { "columnSpan": 4 } },
  { "formControlName": "sld",   "label": "Slider",      "config": { "attributes": { "inputType": "slider", "min": 0, "max": 10, "value": 3 } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "rate",  "label": "Rating",      "config": { "attributes": { "inputType": "rating", "stars": 5 } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "color", "label": "Colour",      "config": { "attributes": { "inputType": "colorPicker", "value": "#3b82f6" } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "files", "label": "Files",       "config": { "attributes": { "inputType": "fileUpload", "multiple": true, "accept": "image/*" } }, "layout": { "columnSpan": 6 } },
  { "formControlName": "go",    "btnLabel": "Submit",   "config": { "attributes": { "inputType": "button", "buttonRole": "submit", "icon": "pi pi-check", "acceptedEvents": ["click"] } }, "layout": { "columnSpan": 4 } }
]
```

**Verify:** every field renders correctly, the Live State JSON updates as you
interact, and no console errors appear.

### 5.2 Conditional field (`showWhen`)

```json
[
  {
    "formControlName": "isCompany", "label": "Buying as a company?",
    "config": { "attributes": { "inputType": "toggle", "value": false, "cardLayout": true, "cardIcon": "pi pi-briefcase", "acceptedEvents": ["change"] } },
    "layout": { "columnSpan": 12, "order": 1 }
  },
  {
    "formControlName": "vatNumber", "label": "VAT Number",
    "showWhen": { "conditions": [{ "field": "isCompany", "operator": "eq", "value": true }] },
    "config": { "attributes": { "inputType": "text", "acceptedEvents": ["change", "blur"] } },
    "validations": { "rules": { "required": true, "minLength": 6 } },
    "layout": { "columnSpan": 12, "order": 2 }
  }
]
```

**Verify:** `vatNumber` is hidden initially; toggling the switch reveals it;
toggling back hides it.

### 5.3 Repeater with min/max bounds

```json
[
  {
    "formControlName": "phones", "label": "Phone numbers",
    "config": {
      "attributes": {
        "inputType": "repeater", "minRows": 1, "maxRows": 3,
        "addLabel": "Add phone",
        "itemFields": [
          { "formControlName": "kind",   "label": "Kind",   "config": { "attributes": { "inputType": "select", "options": [{"label":"Home","value":"home"},{"label":"Work","value":"work"}], "optionLabel": "label", "optionValue": "value" } }, "layout": { "columnSpan": 4 } },
          { "formControlName": "number", "label": "Number", "config": { "attributes": { "inputType": "text", "type": "tel", "keyfilter": "int" } }, "validations": { "rules": { "required": true, "pattern": "^[0-9]{7,}$" } }, "layout": { "columnSpan": 8 } }
        ],
        "value": [{ "kind": "home", "number": "" }]
      }
    },
    "layout": { "columnSpan": 12 }
  }
]
```

**Verify:** start with 1 row, "Add phone" works up to 3 rows then is a no-op;
trash on row 1 with only 1 row left is a no-op; `keyfilter: int` blocks letters.

### 5.4 Wizard schema (use with `<ngx-json-form-stepper>`)

```ts
const schema: FormSchema = {
  steps: [
    {
      id: 'basics',
      title: 'Basics',
      fields: [
        { formControlName: 'firstName', label: 'First Name', config: { attributes: { inputType: 'text' } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
        { formControlName: 'lastName',  label: 'Last Name',  config: { attributes: { inputType: 'text' } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      fields: [
        { formControlName: 'email', label: 'Email', config: { attributes: { inputType: 'text', type: 'email' } }, validations: { rules: { required: true, email: true } }, layout: { columnSpan: 12 } },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      skipValidation: true,
      fields: [
        { formControlName: 'note', label: 'Anything else?', config: { attributes: { inputType: 'textarea', rows: 4 } }, layout: { columnSpan: 12 } },
      ],
    },
  ],
};
```

Use it in a host component:

```html
<ngx-json-form-stepper [schema]="schema" submitLabel="Create account"
  (formSubmit)="handleSubmit($event)" />
```

---

## 6. Edge cases & regression checklist

Re-test these whenever the library touches the renderer or core service.

- **Hot-swap schema** — paste a completely different JSON in the editor; the
  form must rebuild without leftover controls or stale errors.
- **Required + pattern combined** — both errors should be reachable;
  required wins when empty, pattern fires once the user types something
  non-matching.
- **`transient` flag** — submit payload (the green success panel JSON) must
  exclude any field whose def has `"transient": true`.
- **`disabled` field** — set `"disabled": true` in JSON; field is rendered but
  not editable, and its value is **still in the raw value** (because we use
  `getRawValue()`).
- **File upload** — pick a `.png`, then click ✕ to remove; counts and previews
  stay in sync. Then pick multiple files (with `multiple: true`); previews
  append rather than replace.
- **showWhen operators** — try `eq`, `neq`, `in`, `notIn`, `truthy`, `falsy`,
  `contains`, `matches`. All should flip the field's visibility correctly.
- **Repeater state on schema swap** — adding rows then editing the schema
  JSON to change `itemFields` should not crash; rows reset cleanly.
- **Computed field divide-by-deps** — clearing both deps must yield an empty
  string, not `"undefined undefined"`.
- **Console hygiene** — DevTools console must stay clean across every above
  step. Any `NG0` errors, unhandled promise rejections, or Quill warnings are
  bugs.

---

## 7. Reporting bugs

For each finding please capture:

1. **Where** — section / test ID from above (e.g. `F12`, `E4`).
2. **Steps** — minimal sequence to reproduce, starting from a fresh page load.
3. **Expected** vs **actual**.
4. **Console output** — copy any red text from DevTools console.
5. **JSON snippet** — if reproduced via the JSON editor, paste the exact JSON.
6. **Environment** — browser + version, OS, screen size.
7. **Screenshot or short screen recording** if it's a layout/visual issue.

File issues against the repo (the demo links to the GitHub repo in the top
nav). For internal triage, also tag the priority (P1/P2/P3) from §4.

---

## Appendix — file map for reviewers

| Path | What's in it |
|---|---|
| [packages/core/src/lib/types.ts](packages/core/src/lib/types.ts) | All public types — `FormField`, `FieldAttributes`, `FormSchema`, etc. |
| [packages/core/src/lib/form-engine.service.ts](packages/core/src/lib/form-engine.service.ts) | The brain: form builder, validators, conditions, wizard state, FormArray helpers. |
| [packages/core/src/lib/field-registry.service.ts](packages/core/src/lib/field-registry.service.ts) | Custom renderer + async loader + computation registrations. |
| [packages/core/src/lib/async-validator-registry.service.ts](packages/core/src/lib/async-validator-registry.service.ts) | Sync/async validator tokens. |
| [packages/core/src/lib/form-persistence.service.ts](packages/core/src/lib/form-persistence.service.ts) | localStorage bind/save/load. |
| [packages/core/src/lib/image-upload.service.ts](packages/core/src/lib/image-upload.service.ts) | File → base64 + preview tracking. |
| [packages/primeng/src/lib/ngx-form-engine-primeng.component.ts](packages/primeng/src/lib/ngx-form-engine-primeng.component.ts) | The renderer component — every `inputType` lives in its template. |
| [packages/primeng/src/lib/ngx-form-engine-primeng.component.html](packages/primeng/src/lib/ngx-form-engine-primeng.component.html) | Template with one `@case` per `inputType`. |
| [packages/primeng/src/lib/ngx-json-form-stepper.component.ts](packages/primeng/src/lib/ngx-json-form-stepper.component.ts) | Wizard wrapper. |
| [apps/demo/src/app/app.ts](apps/demo/src/app/app.ts) | Demo schema + signals wiring + computed-fn registration. |
| [apps/demo/src/app/app.html](apps/demo/src/app/app.html) | Demo layout (hero / features / form panel / sidebar). |
| [README.md](README.md) | Consumer-facing API docs. |
