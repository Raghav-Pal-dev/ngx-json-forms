import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'tester',
    loadComponent: () =>
      import('./tester/tester-shell').then((m) => m.TesterShellComponent),
    children: [
      { path: '',                redirectTo: 'tier1', pathMatch: 'full' },
      { path: 'tier1',           loadComponent: () => import('./tester/tier1').then((m) => m.Tier1Component) },
      { path: 'simple',          loadComponent: () => import('./tester/simple').then((m) => m.SimpleComponent) },
      { path: 'conditional',     loadComponent: () => import('./tester/conditional').then((m) => m.ConditionalComponent) },
      { path: 'repeater',        loadComponent: () => import('./tester/repeater').then((m) => m.RepeaterComponent) },
      { path: 'wizard',          loadComponent: () => import('./tester/wizard').then((m) => m.WizardComponent) },
      { path: 'computed',        loadComponent: () => import('./tester/computed').then((m) => m.ComputedComponent) },
      { path: 'custom-validator',loadComponent: () => import('./tester/custom-validator').then((m) => m.CustomValidatorComponent) },
      { path: 'otp',             loadComponent: () => import('./tester/otp').then((m) => m.OtpComponent) },
      { path: 'currency',        loadComponent: () => import('./tester/currency').then((m) => m.CurrencyComponent) },
      { path: 'tag-input',       loadComponent: () => import('./tester/tag-input').then((m) => m.TagInputComponent) },
      { path: 'date-range',      loadComponent: () => import('./tester/date-range').then((m) => m.DateRangeComponent) },
      { path: 'signature',       loadComponent: () => import('./tester/signature').then((m) => m.SignatureComponent) },
      { path: 'address',         loadComponent: () => import('./tester/address').then((m) => m.AddressComponent) },
      { path: 'drag-upload',     loadComponent: () => import('./tester/drag-upload').then((m) => m.DragUploadComponent) },
      { path: 'tree-select',     loadComponent: () => import('./tester/tree-select').then((m) => m.TreeSelectComponent) },
      { path: 'time-slots',      loadComponent: () => import('./tester/time-slots').then((m) => m.TimeSlotsComponent) },
      { path: 'markdown',        loadComponent: () => import('./tester/markdown').then((m) => m.MarkdownComponent) },
      { path: 'captcha',         loadComponent: () => import('./tester/captcha').then((m) => m.CaptchaComponent) },
      { path: 'image-crop',      loadComponent: () => import('./tester/image-crop').then((m) => m.ImageCropComponent) },
      { path: 'phone-intl',      loadComponent: () => import('./tester/phone-intl').then((m) => m.PhoneIntlComponent) },
      { path: 'code',            loadComponent: () => import('./tester/code').then((m) => m.CodeComponent) },
    ],
  },
];
