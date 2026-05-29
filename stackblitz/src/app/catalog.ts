/**
 * Single source of truth for the field showcase. Drives the gallery cards and
 * every per-field page (live preview + copy-paste config + Open-in-StackBlitz).
 *
 * Each entry carries BOTH:
 *   - `fields`: a live FormField[] the page renders via <ngx-json-form>, and
 *   - `code`:   the copy-paste TS snippet shown to the developer.
 *
 * The `sb` slug maps to a file in the /stackblitz starter (src/app/fields/<sb>.ts)
 * so the "Open in StackBlitz" button can deep-link straight to that example.
 */
import { FormField } from '@ngx-json-forms/core';

export type FieldCategory =
  | 'Text'
  | 'Choice'
  | 'Numbers'
  | 'Date & time'
  | 'Files & media'
  | 'Specialised'
  | 'Composite'
  | 'Layout';

export interface FieldDemo {
  id: string;
  title: string;
  category: FieldCategory;
  /** PrimeIcon shown on the gallery card. */
  icon: string;
  /** One-line gallery blurb. */
  blurb: string;
  /** Version the field landed in (optional). */
  since?: string;
  /** Optional peer dependency note. */
  peer?: string;
  /** Live config rendered in the preview. */
  fields: FormField[];
  /** Copy-paste snippet shown on the page. */
  code: string;
  /** StackBlitz example file slug (src/app/fields/<sb>.ts). */
  sb: string;
}

/** Small helper to keep accepted-events terse in configs. */
const ev = (...e: string[]) => e;

export const FIELD_CATALOG: FieldDemo[] = [
  // ─────────────────────────── Text ───────────────────────────
  {
    id: 'text',
    title: 'Text',
    category: 'Text',
    icon: 'pi pi-pencil',
    blurb: 'Single-line text with validation, icons and key filters.',
    sb: 'text',
    fields: [
      {
        formControlName: 'firstName',
        label: 'First name',
        placeholder: 'e.g. Ada',
        config: { attributes: { inputType: 'text', fieldIcon: 'pi pi-user', fieldPos: 'left', acceptedEvents: ev('change', 'blur') } },
        validations: { rules: { required: true, minLength: 2 } },
        layout: { columnSpan: 12 },
      },
    ],
    code: `presets.text({ formControlName: 'firstName', label: 'First name', required: true })`,
  },
  {
    id: 'email',
    title: 'Email',
    category: 'Text',
    icon: 'pi pi-envelope',
    blurb: 'Text input with the built-in email validator + envelope icon.',
    sb: 'email',
    fields: [
      presetEmail('email', 'Email'),
    ],
    code: `presets.email({ formControlName: 'email', label: 'Email' })`,
  },
  {
    id: 'password',
    title: 'Password',
    category: 'Text',
    icon: 'pi pi-lock',
    blurb: 'Masked input with a strength meter and show/hide toggle.',
    sb: 'password',
    fields: [
      {
        formControlName: 'password',
        label: 'Password',
        placeholder: 'Choose a strong password',
        config: { attributes: { inputType: 'password', feedback: true, toggleMask: true, acceptedEvents: ev('blur') } },
        validations: { rules: { required: true, minLength: 8 } },
        layout: { columnSpan: 12 },
      },
    ],
    code: `presets.password({ formControlName: 'password', label: 'Password', strong: true })`,
  },
  {
    id: 'confirmPassword',
    title: 'Confirm password',
    category: 'Text',
    icon: 'pi pi-shield',
    blurb: 'Second password field with a cross-field "matches" validator.',
    sb: 'confirm-password',
    fields: [
      { formControlName: 'password', label: 'Password', config: { attributes: { inputType: 'password', toggleMask: true, feedback: false } }, validations: { rules: { required: true } }, layout: { columnSpan: 12 } },
      { formControlName: 'confirm', label: 'Confirm password', config: { attributes: { inputType: 'confirmPassword', matchField: 'password', toggleMask: true } }, validations: { rules: { required: true, matches: 'password' } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'confirm', label: 'Confirm password',
  config: { attributes: { inputType: 'confirmPassword', matchField: 'password' } },
  validations: { rules: { required: true, matches: 'password' } } }`,
  },
  {
    id: 'textarea',
    title: 'Textarea',
    category: 'Text',
    icon: 'pi pi-align-left',
    blurb: 'Multi-line text with a configurable row count.',
    sb: 'textarea',
    fields: [
      { formControlName: 'bio', label: 'Bio', placeholder: 'Tell us about yourself…', config: { attributes: { inputType: 'textarea', rows: 4, acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'bio', label: 'Bio',
  config: { attributes: { inputType: 'textarea', rows: 4 } } }`,
  },
  {
    id: 'phone',
    title: 'Phone (basic)',
    category: 'Text',
    icon: 'pi pi-phone',
    blurb: 'Plain tel input with a phone icon and digit key-filter.',
    sb: 'phone',
    fields: [
      presetPhone('phone', 'Phone'),
    ],
    code: `presets.phone({ formControlName: 'phone', label: 'Phone' })`,
  },

  // ─────────────────────────── Choice ───────────────────────────
  {
    id: 'select',
    title: 'Select',
    category: 'Choice',
    icon: 'pi pi-chevron-circle-down',
    blurb: 'Single-select dropdown with filter + clear.',
    sb: 'select',
    fields: [
      { formControlName: 'country', label: 'Country', placeholder: 'Pick one', config: { attributes: { inputType: 'select', options: countryOpts(), optionLabel: 'label', optionValue: 'value', filter: true, showClear: true, acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'country', label: 'Country',
  config: { attributes: { inputType: 'select', filter: true, showClear: true,
    options: [{ label: 'India', value: 'IN' }, { label: 'United States', value: 'US' }] } } }`,
  },
  {
    id: 'multiSelect',
    title: 'MultiSelect',
    category: 'Choice',
    icon: 'pi pi-list-check',
    blurb: 'Multi-value dropdown with chips + filtering.',
    sb: 'multi-select',
    fields: [
      { formControlName: 'interests', label: 'Interests', placeholder: 'Select interests', config: { attributes: { inputType: 'multiSelect', display: 'chip', filter: true, optionLabel: 'label', optionValue: 'value', options: [{ label: 'Angular', value: 'ng' }, { label: 'TypeScript', value: 'ts' }, { label: 'Rust', value: 'rs' }, { label: 'AI / ML', value: 'ai' }], acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'interests', label: 'Interests',
  config: { attributes: { inputType: 'multiSelect', display: 'chip', filter: true, options: [...] } } }`,
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    category: 'Choice',
    icon: 'pi pi-search',
    blurb: 'Type-ahead suggestions with a dropdown trigger.',
    sb: 'autocomplete',
    fields: [
      { formControlName: 'city', label: 'City', placeholder: 'Type to search…', config: { attributes: { inputType: 'autocomplete', dropdown: true, suggestions: ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai'], minLength: 1, acceptedEvents: ev('complete', 'select') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'city', label: 'City',
  config: { attributes: { inputType: 'autocomplete', dropdown: true,
    suggestions: ['Bengaluru', 'Mumbai', 'Delhi'] } } }`,
  },
  {
    id: 'dependentDropdown',
    title: 'Cascade select',
    category: 'Choice',
    icon: 'pi pi-sitemap',
    blurb: 'Multi-level cascading dropdown (country → state → city).',
    sb: 'cascade',
    fields: [
      {
        formControlName: 'location', label: 'Location', placeholder: 'Select a city',
        config: { attributes: { inputType: 'dependentDropdown', optionLabel: 'cname', optionValue: 'ccode', optionGroupLabel: 'name', optionGroupChildren: ['states', 'cities'], acceptedEvents: ev('change'),
          options: [
            { name: 'India', code: 'IN', states: [{ name: 'Karnataka', cities: [{ cname: 'Bengaluru', ccode: 'BLR' }, { cname: 'Mysuru', ccode: 'MYS' }] }, { name: 'Maharashtra', cities: [{ cname: 'Mumbai', ccode: 'BOM' }, { cname: 'Pune', ccode: 'PNQ' }] }] },
            { name: 'United States', code: 'US', states: [{ name: 'California', cities: [{ cname: 'Los Angeles', ccode: 'LAX' }, { cname: 'San Francisco', ccode: 'SFO' }] }] },
          ] } },
        layout: { columnSpan: 12 },
      },
    ],
    code: `{ formControlName: 'location', label: 'Location',
  config: { attributes: { inputType: 'dependentDropdown',
    optionGroupChildren: ['states', 'cities'], options: [...] } } }`,
  },
  {
    id: 'radio',
    title: 'Radio group',
    category: 'Choice',
    icon: 'pi pi-circle',
    blurb: 'Mutually-exclusive options laid out inline.',
    sb: 'radio',
    fields: [
      { formControlName: 'plan', label: 'Plan', config: { attributes: { inputType: 'radio', optionLabel: 'label', optionValue: 'value', options: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }, { label: 'Enterprise', value: 'ent' }], acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'plan', label: 'Plan',
  config: { attributes: { inputType: 'radio', options: [{ label: 'Free', value: 'free' }, ...] } } }`,
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    category: 'Choice',
    icon: 'pi pi-check-square',
    blurb: 'Single boolean checkbox (binary mode).',
    sb: 'checkbox',
    fields: [
      { formControlName: 'terms', label: 'I agree to the terms', config: { attributes: { inputType: 'checkbox', binary: true, acceptedEvents: ev('change') } }, validations: { rules: { required: true } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'terms', label: 'I agree to the terms',
  config: { attributes: { inputType: 'checkbox', binary: true } } }`,
  },
  {
    id: 'toggle',
    title: 'Toggle',
    category: 'Choice',
    icon: 'pi pi-power-off',
    blurb: 'On/off switch bound to a boolean.',
    sb: 'toggle',
    fields: [
      { formControlName: 'newsletter', label: 'Subscribe to newsletter', config: { attributes: { inputType: 'toggle', value: false, acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'newsletter', label: 'Subscribe to newsletter',
  config: { attributes: { inputType: 'toggle', value: false } } }`,
  },
  {
    id: 'colorPicker',
    title: 'Color picker',
    category: 'Choice',
    icon: 'pi pi-palette',
    blurb: 'Swatch + popover color selection.',
    sb: 'color-picker',
    fields: [
      { formControlName: 'brand', label: 'Brand color', config: { attributes: { inputType: 'colorPicker', value: '#2563eb', acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'brand', label: 'Brand color',
  config: { attributes: { inputType: 'colorPicker', value: '#2563eb' } } }`,
  },
  {
    id: 'treeSelect',
    title: 'Tree select',
    category: 'Choice',
    icon: 'pi pi-folder',
    blurb: 'Hierarchical select (single / multiple / checkbox).',
    sb: 'tree-select',
    fields: [
      { formControlName: 'dept', label: 'Department', placeholder: 'Select', config: { attributes: { inputType: 'treeSelect', treeSelectionMode: 'single', showClear: true, acceptedEvents: ev('select'), nodes: [{ key: '1', label: 'Engineering', children: [{ key: '1-0', label: 'Frontend' }, { key: '1-1', label: 'Backend' }] }, { key: '2', label: 'Sales' }] } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'dept', label: 'Department',
  config: { attributes: { inputType: 'treeSelect', nodes: [...] } } }`,
  },

  // ─────────────────────────── Numbers ───────────────────────────
  {
    id: 'number',
    title: 'Number',
    category: 'Numbers',
    icon: 'pi pi-hashtag',
    blurb: 'Numeric input with min/max constraints.',
    sb: 'number',
    fields: [
      { formControlName: 'qty', label: 'Quantity', placeholder: '0', config: { attributes: { inputType: 'text', type: 'number', min: 0, max: 999, acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'qty', label: 'Quantity',
  config: { attributes: { inputType: 'text', type: 'number', min: 0, max: 999 } } }`,
  },
  {
    id: 'currency',
    title: 'Currency',
    category: 'Numbers',
    icon: 'pi pi-dollar',
    blurb: 'Locale-aware money input (USD, EUR, INR, …).',
    since: '1.7.0',
    sb: 'currency',
    fields: [
      presetCurrency('price', 'Price (USD)'),
    ],
    code: `presets.currency({ formControlName: 'price', label: 'Price (USD)', currency: 'USD' })`,
  },
  {
    id: 'rating',
    title: 'Rating',
    category: 'Numbers',
    icon: 'pi pi-star',
    blurb: 'Star rating bound to a number.',
    sb: 'rating',
    fields: [
      { formControlName: 'score', label: 'Rating', config: { attributes: { inputType: 'rating', stars: 5, acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'score', label: 'Rating',
  config: { attributes: { inputType: 'rating', stars: 5 } } }`,
  },
  {
    id: 'slider',
    title: 'Slider',
    category: 'Numbers',
    icon: 'pi pi-sliders-h',
    blurb: 'Drag-to-set numeric slider with min/max/step.',
    sb: 'slider',
    fields: [
      { formControlName: 'volume', label: 'Volume', config: { attributes: { inputType: 'slider', min: 0, max: 100, step: 5, value: 30, acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'volume', label: 'Volume',
  config: { attributes: { inputType: 'slider', min: 0, max: 100, step: 5 } } }`,
  },
  {
    id: 'otp',
    title: 'OTP',
    category: 'Numbers',
    icon: 'pi pi-key',
    blurb: 'Segmented one-time-code / PIN input.',
    since: '1.6.0',
    sb: 'otp',
    fields: [
      presetOtp('code', 'Verification code'),
    ],
    code: `presets.otp({ formControlName: 'code', label: 'Verification code', length: 6 })`,
  },

  // ─────────────────────────── Date & time ───────────────────────────
  {
    id: 'datePicker',
    title: 'Date picker',
    category: 'Date & time',
    icon: 'pi pi-calendar',
    blurb: 'Calendar with inline icon trigger.',
    sb: 'date-picker',
    fields: [
      { formControlName: 'eventDate', label: 'Event date', placeholder: 'Select a date', config: { attributes: { inputType: 'datePicker', showIcon: true, acceptedEvents: ev('select') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'eventDate', label: 'Event date',
  config: { attributes: { inputType: 'datePicker', showIcon: true } } }`,
  },
  {
    id: 'time',
    title: 'Time picker',
    category: 'Date & time',
    icon: 'pi pi-clock',
    blurb: 'Time-only spinner (24h or 12h).',
    sb: 'time',
    fields: [
      { formControlName: 'eventTime', label: 'Event time', placeholder: 'Select a time', config: { attributes: { inputType: 'time', hourFormat: '24', acceptedEvents: ev('select') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'eventTime', label: 'Event time',
  config: { attributes: { inputType: 'time', hourFormat: '24' } } }`,
  },
  {
    id: 'month',
    title: 'Month picker',
    category: 'Date & time',
    icon: 'pi pi-calendar-minus',
    blurb: 'Month + year selection grid.',
    sb: 'month',
    fields: [
      { formControlName: 'birthMonth', label: 'Birth month', placeholder: 'mm/yy', config: { attributes: { inputType: 'month', dateFormat: 'mm/yy', acceptedEvents: ev('select') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'birthMonth', label: 'Birth month',
  config: { attributes: { inputType: 'month', dateFormat: 'mm/yy' } } }`,
  },
  {
    id: 'year',
    title: 'Year picker',
    category: 'Date & time',
    icon: 'pi pi-calendar-plus',
    blurb: 'Year-only selection grid.',
    sb: 'year',
    fields: [
      { formControlName: 'startYear', label: 'Start year', placeholder: 'yyyy', config: { attributes: { inputType: 'year', dateFormat: 'yy', acceptedEvents: ev('select') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'startYear', label: 'Start year',
  config: { attributes: { inputType: 'year', dateFormat: 'yy' } } }`,
  },
  {
    id: 'dateRange',
    title: 'Date range',
    category: 'Date & time',
    icon: 'pi pi-calendar-times',
    blurb: 'Start/end range picker (check-in / check-out).',
    since: '1.9.0',
    sb: 'date-range',
    fields: [
      presetDateRange('stay', 'Hotel stay'),
    ],
    code: `presets.dateRange({ formControlName: 'stay', label: 'Hotel stay' })`,
  },
  {
    id: 'timeSlots',
    title: 'Time slots',
    category: 'Date & time',
    icon: 'pi pi-th-large',
    blurb: 'Appointment-style clickable slot grid.',
    since: '1.14.0',
    sb: 'time-slots',
    fields: [
      presetTimeSlots('appt', 'Pick a time'),
    ],
    code: `presets.timeSlots({ formControlName: 'appt', label: 'Pick a time',
  slots: ['09:00', '09:30', '10:00', '10:30'] })`,
  },

  // ─────────────────────────── Files & media ───────────────────────────
  {
    id: 'fileUpload',
    title: 'File upload',
    category: 'Files & media',
    icon: 'pi pi-upload',
    blurb: 'Basic single-file upload with image preview.',
    sb: 'file-upload',
    fields: [
      { formControlName: 'avatar', label: 'Avatar', config: { attributes: { inputType: 'fileUpload', accept: 'image/*', maxFileSize: 1000000, chooseLabel: 'Upload avatar', acceptedEvents: ev('uploadHandler') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'avatar', label: 'Avatar',
  config: { attributes: { inputType: 'fileUpload', accept: 'image/*' } } }`,
  },
  {
    id: 'dragUpload',
    title: 'Drag & drop upload',
    category: 'Files & media',
    icon: 'pi pi-cloud-upload',
    blurb: 'Full drop-zone with multi-file queue.',
    since: '1.12.0',
    sb: 'drag-upload',
    fields: [
      presetDragUpload('files', 'Attachments'),
    ],
    code: `presets.dragUpload({ formControlName: 'files', label: 'Attachments', multiple: true })`,
  },
  {
    id: 'imageCrop',
    title: 'Image crop',
    category: 'Files & media',
    icon: 'pi pi-crop',
    blurb: 'Pick + crop an image → PNG data URL.',
    since: '1.17.0',
    peer: 'cropperjs',
    sb: 'image-crop',
    fields: [
      presetImageCrop('cover', 'Cover image (16:9)'),
    ],
    code: `presets.imageCrop({ formControlName: 'cover', label: 'Cover image', aspectRatio: 16/9 })`,
  },
  {
    id: 'signature',
    title: 'Signature',
    category: 'Files & media',
    icon: 'pi pi-pencil',
    blurb: 'Canvas signature pad → PNG data URL.',
    since: '1.10.0',
    sb: 'signature',
    fields: [
      presetSignature('sign', 'Signature'),
    ],
    code: `presets.signature({ formControlName: 'sign', label: 'Signature' })`,
  },

  // ─────────────────────────── Specialised ───────────────────────────
  {
    id: 'tagInput',
    title: 'Tag input',
    category: 'Specialised',
    icon: 'pi pi-tags',
    blurb: 'Chip-style multi-string entry (tokens / emails).',
    since: '1.8.0',
    sb: 'tag-input',
    fields: [
      presetTagInput('tags', 'Tags'),
    ],
    code: `presets.tagInput({ formControlName: 'tags', label: 'Tags' })`,
  },
  {
    id: 'phoneIntl',
    title: 'Phone (international)',
    category: 'Specialised',
    icon: 'pi pi-globe',
    blurb: 'Country flag + libphonenumber-js → E.164 output.',
    since: '1.18.0',
    peer: 'libphonenumber-js',
    sb: 'phone-intl',
    fields: [
      presetPhoneIntl('mobile', 'Mobile'),
    ],
    code: `presets.phoneIntl({ formControlName: 'mobile', label: 'Mobile', defaultCountry: 'IN' })`,
  },
  {
    id: 'markdown',
    title: 'Markdown editor',
    category: 'Specialised',
    icon: 'pi pi-hashtag',
    blurb: 'Textarea + live HTML preview.',
    since: '1.15.0',
    peer: 'marked',
    sb: 'markdown',
    fields: [
      presetMarkdown('notes', 'Notes'),
    ],
    code: `presets.markdown({ formControlName: 'notes', label: 'Notes', rows: 6 })`,
  },
  {
    id: 'editor',
    title: 'Rich text (Quill)',
    category: 'Specialised',
    icon: 'pi pi-align-center',
    blurb: 'WYSIWYG rich-text editor via PrimeNG + Quill.',
    peer: 'quill',
    sb: 'editor',
    fields: [
      { formControlName: 'desc', label: 'Description', config: { attributes: { inputType: 'editor', acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: 'desc', label: 'Description',
  config: { attributes: { inputType: 'editor' } } }`,
  },
  {
    id: 'code',
    title: 'Code editor',
    category: 'Specialised',
    icon: 'pi pi-code',
    blurb: 'CodeMirror 6 with JSON / JS / HTML / CSS / markdown.',
    since: '1.19.0',
    peer: '@codemirror/*',
    sb: 'code',
    fields: [
      presetCode('json', 'JSON snippet'),
    ],
    code: `presets.code({ formControlName: 'json', label: 'JSON snippet', language: 'json' })`,
  },
  {
    id: 'captcha',
    title: 'Captcha',
    category: 'Specialised',
    icon: 'pi pi-verified',
    blurb: 'Cloudflare Turnstile widget → verification token.',
    since: '1.16.0',
    sb: 'captcha',
    fields: [
      presetCaptcha('captcha', 'Captcha'),
    ],
    code: `presets.captcha({ formControlName: 'captcha', label: 'Captcha',
  sitekey: '1x00000000000000000000AA' })`,
  },

  // ─────────────────────────── Composite ───────────────────────────
  {
    id: 'address',
    title: 'Address',
    category: 'Composite',
    icon: 'pi pi-map-marker',
    blurb: 'Nested group preset — line1/2, city, state, postal, country.',
    since: '1.11.0',
    sb: 'address',
    fields: [
      presetAddress('shipping', 'Shipping address'),
    ],
    code: `presets.address({ formControlName: 'shipping', label: 'Shipping address' })`,
  },
  {
    id: 'group',
    title: 'Group',
    category: 'Composite',
    icon: 'pi pi-objects-column',
    blurb: 'Arbitrary nested FormGroup of sub-fields.',
    sb: 'group',
    fields: [
      {
        formControlName: 'contact', label: 'Emergency contact',
        config: { attributes: { inputType: 'group', groupFields: [
          { formControlName: 'name', label: 'Name', config: { attributes: { inputType: 'text', acceptedEvents: ev('change', 'blur') } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
          { formControlName: 'relation', label: 'Relation', config: { attributes: { inputType: 'text', acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 6 } },
        ] } },
        layout: { columnSpan: 12 },
      },
    ],
    code: `{ formControlName: 'contact', label: 'Emergency contact',
  config: { attributes: { inputType: 'group', groupFields: [...] } } }`,
  },
  {
    id: 'repeater',
    title: 'Repeater (FormArray)',
    category: 'Composite',
    icon: 'pi pi-clone',
    blurb: 'Add/remove rows backed by a FormArray.',
    sb: 'repeater',
    fields: [
      {
        formControlName: 'phones', label: 'Phone numbers',
        config: { attributes: { inputType: 'repeater', minRows: 1, maxRows: 3, addLabel: 'Add phone', value: [{ kind: 'home', number: '' }], itemFields: [
          { formControlName: 'kind', label: 'Kind', config: { attributes: { inputType: 'select', optionLabel: 'label', optionValue: 'value', options: [{ label: 'Home', value: 'home' }, { label: 'Work', value: 'work' }], acceptedEvents: ev('change') } }, layout: { columnSpan: 4 } },
          { formControlName: 'number', label: 'Number', config: { attributes: { inputType: 'text', type: 'tel', keyfilter: 'int', acceptedEvents: ev('change', 'blur') } }, validations: { rules: { required: true } }, layout: { columnSpan: 8 } },
        ] } },
        layout: { columnSpan: 12 },
      },
    ],
    code: `{ formControlName: 'phones', label: 'Phone numbers',
  config: { attributes: { inputType: 'repeater', minRows: 1, maxRows: 3, itemFields: [...] } } }`,
  },

  // ─────────────────────────── Layout ───────────────────────────
  {
    id: 'staticText',
    title: 'Static text / HTML',
    category: 'Layout',
    icon: 'pi pi-info-circle',
    blurb: 'Render arbitrary HTML — no form control.',
    sb: 'static-text',
    fields: [
      { formControlName: '_info', config: { attributes: { inputType: 'staticText', value: '<strong>Heads up:</strong> static text renders arbitrary HTML for instructions, callouts and notices.' } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: '_info',
  config: { attributes: { inputType: 'staticText', value: '<strong>Heads up:</strong> …' } } }`,
  },
  {
    id: 'divider',
    title: 'Divider',
    category: 'Layout',
    icon: 'pi pi-minus',
    blurb: 'Horizontal/vertical separator with optional label.',
    sb: 'divider',
    fields: [
      { formControlName: '_d1', config: { attributes: { inputType: 'staticText', value: 'Section A' } }, layout: { columnSpan: 12 } },
      { formControlName: '_div', config: { attributes: { inputType: 'divider', dividerLayout: 'horizontal', dividerType: 'dashed' } }, layout: { columnSpan: 12 } },
      { formControlName: '_d2', config: { attributes: { inputType: 'staticText', value: 'Section B' } }, layout: { columnSpan: 12 } },
    ],
    code: `{ formControlName: '_div',
  config: { attributes: { inputType: 'divider', dividerType: 'dashed' } } }`,
  },
  {
    id: 'button',
    title: 'Button',
    category: 'Layout',
    icon: 'pi pi-bolt',
    blurb: 'Submit / reset / cancel / custom action buttons.',
    sb: 'button',
    fields: [
      { formControlName: 'resetBtn', btnLabel: 'Reset', config: { attributes: { inputType: 'button', buttonRole: 'reset', text: true, icon: 'pi pi-refresh', acceptedEvents: ev('click') } }, layout: { columnSpan: 6 } },
      { formControlName: 'submitBtn', btnLabel: 'Submit', config: { attributes: { inputType: 'button', buttonRole: 'submit', icon: 'pi pi-check', acceptedEvents: ev('click') } }, layout: { columnSpan: 6 } },
    ],
    code: `presets.submit({ formControlName: 'submitBtn', label: 'Submit' })`,
  },
];

export const CATEGORIES: FieldCategory[] = [
  'Text', 'Choice', 'Numbers', 'Date & time', 'Files & media', 'Specialised', 'Composite', 'Layout',
];

export function findField(id: string): FieldDemo | undefined {
  return FIELD_CATALOG.find((f) => f.id === id);
}

// ─── tiny config builders (mirror the presets so previews stay self-contained) ───
function countryOpts() {
  return [
    { label: '🇮🇳 India', value: 'IN' },
    { label: '🇺🇸 United States', value: 'US' },
    { label: '🇬🇧 United Kingdom', value: 'GB' },
    { label: '🇩🇪 Germany', value: 'DE' },
  ];
}
function presetEmail(name: string, label: string): FormField {
  return { formControlName: name, label, placeholder: 'name@example.com', config: { attributes: { inputType: 'text', type: 'email', fieldIcon: 'pi pi-envelope', fieldPos: 'left', acceptedEvents: ev('change', 'blur') } }, validations: { rules: { required: true, email: true } }, layout: { columnSpan: 12 } };
}
function presetPhone(name: string, label: string): FormField {
  return { formControlName: name, label, placeholder: 'Phone number', config: { attributes: { inputType: 'text', type: 'tel', fieldIcon: 'pi pi-phone', fieldPos: 'left', keyfilter: 'int', acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 12 } };
}
function presetCurrency(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'currency', currency: 'USD', locale: 'en-US', acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 12 } };
}
function presetOtp(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'otp', length: 6, acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } };
}
function presetDateRange(name: string, label: string): FormField {
  return { formControlName: name, label, placeholder: 'Start – End', config: { attributes: { inputType: 'datePicker', selectionMode: 'range', showIcon: true, numberOfMonths: 2, acceptedEvents: ev('select') } }, layout: { columnSpan: 12 } };
}
function presetTimeSlots(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'timeSlots', slots: ['09:00', '09:30', '10:00', '10:30', '11:00'], acceptedEvents: ev('change') } }, layout: { columnSpan: 12 } };
}
function presetDragUpload(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'dragUpload', multiple: true, maxFileSize: 5000000, acceptedEvents: ev('uploadHandler') } }, layout: { columnSpan: 12 } };
}
function presetImageCrop(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'imageCrop', aspectRatio: 16 / 9, maxOutputWidth: 1280, maxOutputHeight: 720 } }, layout: { columnSpan: 12 } };
}
function presetSignature(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'signature', height: 180 } }, layout: { columnSpan: 12 } };
}
function presetTagInput(name: string, label: string): FormField {
  return { formControlName: name, label, placeholder: 'Press enter to add', config: { attributes: { inputType: 'tagInput', acceptedEvents: ev('add', 'remove') } }, layout: { columnSpan: 12 } };
}
function presetPhoneIntl(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'phoneIntl', defaultCountry: 'IN' } }, layout: { columnSpan: 12 } };
}
function presetMarkdown(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'markdown', rows: 6, mdLayout: 'split' } }, layout: { columnSpan: 12 } };
}
function presetCode(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'code', language: 'json', editorHeight: '12rem' } }, layout: { columnSpan: 12 } };
}
function presetCaptcha(name: string, label: string): FormField {
  return { formControlName: name, label, config: { attributes: { inputType: 'captcha', sitekey: '1x00000000000000000000AA' } }, layout: { columnSpan: 12 } };
}
function presetAddress(name: string, label: string): FormField {
  return {
    formControlName: name, label,
    config: { attributes: { inputType: 'group', groupFields: [
      { formControlName: 'line1', label: 'Address line 1', config: { attributes: { inputType: 'text', acceptedEvents: ev('change', 'blur') } }, validations: { rules: { required: true } }, layout: { columnSpan: 12 } },
      { formControlName: 'city', label: 'City', config: { attributes: { inputType: 'text', acceptedEvents: ev('change', 'blur') } }, validations: { rules: { required: true } }, layout: { columnSpan: 6 } },
      { formControlName: 'postal', label: 'Postal code', config: { attributes: { inputType: 'text', keyfilter: 'int', acceptedEvents: ev('change', 'blur') } }, layout: { columnSpan: 6 } },
    ] } },
    layout: { columnSpan: 12 },
  };
}
