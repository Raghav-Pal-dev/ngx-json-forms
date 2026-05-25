import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // Schematics import @angular-devkit/schematics at INSTALL TIME
          // (via `ng add`), not at runtime — they must not appear in
          // peerDependencies. The schematics folder ships as pre-compiled
          // JS, so the dep checker should skip it entirely.
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/schematics/**/*',
            '{projectRoot}/schematics-compiled/**/*',
          ],
          ignoredDependencies: [
            '@angular-devkit/schematics',
            '@angular-devkit/core',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    // Schematic source files are Node CommonJS, not Angular — relax
    // the Angular-flavoured rules so they don't bleed in.
    files: ['**/schematics/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['ngx', 'lib'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['ngx', 'lib'],
          style: 'kebab-case',
        },
      ],
      // PrimeNG's component API drives a lot of non-null assertions inside
      // the renderer template binding helpers — they're checked at runtime
      // by the @if (ready()) guard upstream. Downgrade to warning.
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      // Trash-can / step-indicator buttons are icon-only; aria comes from
      // surrounding label text or pButton's own icon attribute.
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  },
];
