import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import {
  FORM_ENGINE_STORAGE,
  FORM_ENGINE_TRANSLATE,
  StorageAdapter,
  TranslateFn,
} from './types';

/**
 * Provide a custom storage backend for `FormPersistenceService`. Without
 * this, persistence falls back to `window.localStorage`.
 *
 * @example
 * providers: [
 *   provideFormEngineStorage({
 *     getItem:    (k) => myKv.get(k),
 *     setItem:    (k, v) => myKv.set(k, v),
 *     removeItem: (k) => myKv.delete(k),
 *   }),
 * ]
 */
export function provideFormEngineStorage(adapter: StorageAdapter): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: FORM_ENGINE_STORAGE, useValue: adapter }]);
}

/**
 * Provide a translator for validation messages. Without this, the engine
 * uses English defaults bundled in core.
 *
 * @example
 * providers: [
 *   provideFormEngineTranslator((key, params) => i18n.translate(key, params)),
 * ]
 */
export function provideFormEngineTranslator(translate: TranslateFn): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: FORM_ENGINE_TRANSLATE, useValue: translate }]);
}

/**
 * Convenience one-call wiring helper for the core engine.
 *
 * Use it once at app bootstrap and forget about the individual tokens.
 * UI adapters (e.g. `@ngx-json-forms/primeng`) should still be wired
 * separately because they have their own peer setup (PrimeNG theme,
 * `provideAnimationsAsync`, the `primeicons.css` import, …).
 *
 * @example
 * import { provideNgxJsonForms } from '@ngx-json-forms/core';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideNgxJsonForms({
 *       // both options are optional
 *       storage:   myStorageAdapter,
 *       translate: (key, params) => i18n.translate(key, params),
 *     }),
 *     // ...your other providers (router, animations, PrimeNG theme, …)
 *   ],
 * };
 */
export function provideNgxJsonForms(
  options: {
    storage?: StorageAdapter;
    translate?: TranslateFn;
  } = {},
): EnvironmentProviders {
  const providers: { provide: unknown; useValue: unknown }[] = [];
  if (options.storage)   providers.push({ provide: FORM_ENGINE_STORAGE,   useValue: options.storage });
  if (options.translate) providers.push({ provide: FORM_ENGINE_TRANSLATE, useValue: options.translate });
  return makeEnvironmentProviders(providers);
}
