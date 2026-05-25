import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',                loadComponent: () => import('./tests/home').then(m => m.HomeComponent) },
  { path: 'simple',          loadComponent: () => import('./tests/simple').then(m => m.SimpleComponent) },
  { path: 'conditional',     loadComponent: () => import('./tests/conditional').then(m => m.ConditionalComponent) },
  { path: 'repeater',        loadComponent: () => import('./tests/repeater').then(m => m.RepeaterComponent) },
  { path: 'wizard',          loadComponent: () => import('./tests/wizard').then(m => m.WizardComponent) },
  { path: 'computed',        loadComponent: () => import('./tests/computed').then(m => m.ComputedComponent) },
  { path: 'custom-validator', loadComponent: () => import('./tests/custom-validator').then(m => m.CustomValidatorComponent) },
  { path: 'otp',             loadComponent: () => import('./tests/otp').then(m => m.OtpComponent) },
  { path: 'currency',        loadComponent: () => import('./tests/currency').then(m => m.CurrencyComponent) },
  { path: 'tag-input',       loadComponent: () => import('./tests/tag-input').then(m => m.TagInputComponent) },
  { path: 'date-range',      loadComponent: () => import('./tests/date-range').then(m => m.DateRangeComponent) },
  { path: 'signature',       loadComponent: () => import('./tests/signature').then(m => m.SignatureComponent) },
  { path: 'address',         loadComponent: () => import('./tests/address').then(m => m.AddressComponent) },
  { path: 'drag-upload',     loadComponent: () => import('./tests/drag-upload').then(m => m.DragUploadComponent) },
  { path: 'tree-select',     loadComponent: () => import('./tests/tree-select').then(m => m.TreeSelectComponent) },
];
