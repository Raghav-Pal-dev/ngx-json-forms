import { Routes } from '@angular/router';

export const routes: Routes = [
  // Catalog gallery + per-field live preview. Edit src/app/catalog.ts to tweak any field.
  { path: '',          loadComponent: () => import('./catalog-home').then((m) => m.CatalogHomeComponent) },
  { path: 'field/:id', loadComponent: () => import('./field-view').then((m) => m.FieldViewComponent) },

  // Original hand-written scenario deep-dives (still available).
  { path: 'simple',          loadComponent: () => import('./tests/simple').then(m => m.SimpleComponent) },
  { path: 'conditional',     loadComponent: () => import('./tests/conditional').then(m => m.ConditionalComponent) },
  { path: 'repeater',        loadComponent: () => import('./tests/repeater').then(m => m.RepeaterComponent) },
  { path: 'wizard',          loadComponent: () => import('./tests/wizard').then(m => m.WizardComponent) },
  { path: 'computed',        loadComponent: () => import('./tests/computed').then(m => m.ComputedComponent) },
  { path: 'custom-validator', loadComponent: () => import('./tests/custom-validator').then(m => m.CustomValidatorComponent) },

  { path: '**', redirectTo: '' },
];
