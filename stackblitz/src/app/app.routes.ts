import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',                loadComponent: () => import('./tests/home').then(m => m.HomeComponent) },
  { path: 'simple',          loadComponent: () => import('./tests/simple').then(m => m.SimpleComponent) },
  { path: 'conditional',     loadComponent: () => import('./tests/conditional').then(m => m.ConditionalComponent) },
  { path: 'repeater',        loadComponent: () => import('./tests/repeater').then(m => m.RepeaterComponent) },
  { path: 'wizard',          loadComponent: () => import('./tests/wizard').then(m => m.WizardComponent) },
  { path: 'computed',        loadComponent: () => import('./tests/computed').then(m => m.ComputedComponent) },
  { path: 'custom-validator', loadComponent: () => import('./tests/custom-validator').then(m => m.CustomValidatorComponent) },
];
