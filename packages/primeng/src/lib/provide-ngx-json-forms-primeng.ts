import { EnvironmentProviders, Provider } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { provideNgxJsonForms, StorageAdapter, TranslateFn } from '@ngx-json-forms/core';

/**
 * Options for {@link provideNgxJsonFormsPrimeng}.
 */
export interface NgxJsonFormsPrimengOptions {
  /**
   * PrimeNG theme preset (e.g. the default import from `@primeng/themes/aura`,
   * `@primeng/themes/nora`, `@primeng/themes/lara`, etc).
   *
   * Defaults to `Aura` if omitted.
   */
  theme?: unknown;

  /**
   * Full PrimeNG config object — used as-is if provided. This overrides
   * the simpler `theme` option, so set this when you need to customise
   * ripple, zIndex, csp, translations, etc.
   */
  primengConfig?: unknown;

  /**
   * Options forwarded to {@link provideNgxJsonForms} (storage, translator,
   * etc).
   */
  formEngine?: {
    storage?: StorageAdapter;
    translate?: TranslateFn;
  };
}

/**
 * One-call setup for `ngx-json-forms` with the PrimeNG renderer. Bundles:
 *
 *  - `provideAnimationsAsync()` — required by PrimeNG overlays
 *  - `providePrimeNG({ theme: { preset: Aura, ... } })` — Aura by default
 *  - `provideNgxJsonForms()` — the form engine
 *
 * Replaces three separate provider calls with one line in `app.config.ts`:
 *
 * @example
 * ```ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideRouter(routes),
 *     provideNgxJsonFormsPrimeng(),   // ← one line, theme + animations + engine
 *   ],
 * };
 * ```
 *
 * @example Override the theme (Nora preset, no dark-mode auto-flip):
 * ```ts
 * import Nora from '@primeng/themes/nora';
 *
 * provideNgxJsonFormsPrimeng({ theme: Nora })
 * ```
 *
 * @example Full PrimeNG control (e.g. ripple, CSP nonce):
 * ```ts
 * provideNgxJsonFormsPrimeng({
 *   primengConfig: {
 *     ripple: true,
 *     theme: { preset: Aura, options: { darkModeSelector: '.my-dark' } },
 *   },
 * })
 * ```
 */
export function provideNgxJsonFormsPrimeng(
  options?: NgxJsonFormsPrimengOptions,
): (Provider | EnvironmentProviders)[] {
  const primengConfig =
    options?.primengConfig ?? {
      theme: {
        preset: options?.theme ?? Aura,
        // The library is light-mode only by design; explicitly opting OUT of
        // PrimeNG's auto prefers-color-scheme handling avoids invisible
        // white-on-white inputs for users on dark-mode OS.
        options: { darkModeSelector: '.app-dark' },
      },
    };

  return [
    provideAnimationsAsync(),
    providePrimeNG(primengConfig),
    provideNgxJsonForms(options?.formEngine),
  ];
}
