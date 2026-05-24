# ngx-json-forms playground

A live, editable, fork-it-and-go Angular 21 starter for
[`@ngx-json-forms`](https://www.npmjs.com/package/@ngx-json-forms/core).
Open it in your browser, change any field def, see the form update
instantly.

## Open in StackBlitz

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz)

The button above forks this folder into a fresh StackBlitz workspace —
no install, no clone, nothing to set up locally.

## Six form scenarios

Each route in this app is one scenario, each in its own file under
`src/app/tests/`. Edit the field array, save, watch the form re-render.

| Route | File | Demonstrates |
|---|---|---|
| `/simple`           | [`simple.ts`](src/app/tests/simple.ts)                       | basic text + email with the new `presets.*` factories |
| `/conditional`      | [`conditional.ts`](src/app/tests/conditional.ts)             | `showWhen` — toggle reveals dependent fields |
| `/repeater`         | [`repeater.ts`](src/app/tests/repeater.ts)                   | FormArray with `minRows` / `maxRows` |
| `/wizard`           | [`wizard.ts`](src/app/tests/wizard.ts)                       | multi-step stepper via `FormSchema.steps` |
| `/computed`         | [`computed.ts`](src/app/tests/computed.ts)                   | inline `computed.fn` + `transient: true` |
| `/custom-validator` | [`custom-validator.ts`](src/app/tests/custom-validator.ts)   | inline async `AsyncValidatorFn` in `asyncValidators` |

## Run locally

If you'd rather clone instead of using StackBlitz:

```bash
git clone https://github.com/Raghav-Pal-dev/ngx-json-forms.git
cd ngx-json-forms/stackblitz
npm install
npm start          # http://localhost:4200
```

## What's inside

- Angular 21 standalone-components app
- `@ngx-json-forms/core` + `@ngx-json-forms/primeng` from npm (latest 1.x)
- PrimeNG 21 + Aura theme + PrimeIcons
- One route per scenario; the routes are all lazy-loaded so each scenario
  is a small file you can read top-to-bottom

## License

MIT (same as the parent project).
