import { InjectionToken, TemplateRef, Type } from '@angular/core';
import { AsyncValidatorFn, FormGroup, ValidatorFn } from '@angular/forms';

// ─── Input Types ────────────────────────────────────────────────────────────

export type InputType =
  | 'text'
  | 'password'
  | 'confirmPassword'
  | 'number'
  | 'email'
  | 'select'
  | 'multiSelect'
  | 'autocomplete'
  | 'datePicker'
  | 'time'
  | 'month'
  | 'year'
  | 'toggle'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'editor'
  | 'fileUpload'
  | 'colorPicker'
  | 'rating'
  | 'slider'
  | 'otp'
  | 'currency'
  | 'tagInput'
  | 'signature'
  | 'dragUpload'
  | 'treeSelect'
  | 'staticText'
  | 'divider'
  | 'button'
  | 'dependentDropdown'
  | 'repeater'
  | 'group'
  | string; // allow custom types via the FieldRegistry

// ─── Event Types ─────────────────────────────────────────────────────────────

export type FormEngineEventType =
  | 'focus'
  | 'blur'
  | 'input'
  | 'change'
  | 'click'
  | 'submit'
  | 'reset'
  | 'uploadHandler'
  | 'inputKeydown'
  | 'inputKeyup'
  | 'inputKeypress'
  | 'complete'
  | 'select'
  | 'unselect'
  | 'add'
  | 'remove'
  | 'clear'
  | 'hide'
  | 'show'
  | 'lazyLoad'
  | 'stepChange'
  | 'staticTextClick'
  | string;

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  /** Match value of another control (e.g. confirmPassword) */
  matches?: string;
  /** Custom synchronous validator keys, resolved via ValidatorRegistry */
  custom?: string[];
}

export interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  min?: string;
  max?: string;
  pattern?: string;
  email?: string;
  matches?: string;
  [key: string]: string | undefined;
}

export interface FieldValidations {
  rules?: ValidationRules;
  messages?: ValidationMessages;
  /**
   * Async validator tokens (resolved via `AsyncValidatorRegistry`), or
   * `AsyncValidatorFn` callables (added in 1.1.0). Mix freely.
   */
  asyncValidators?: (string | AsyncValidatorFn)[];
}

/** Cross-field group-level validators evaluated against the FormGroup raw value */
export interface CrossFieldValidator {
  /** Identifier used to look up an error message via FormSchema.crossFieldMessages */
  name: string;
  /**
   * Pure function returning true when the form value satisfies the rule.
   * The error will be exposed on the FormGroup under errors[`crossField:<name>`].
   */
  validate: (value: Record<string, unknown>) => boolean;
  /** Form control names that should display the error inline */
  appliesTo?: string[];
  message?: string;
}

// ─── Conditional Display ──────────────────────────────────────────────────────

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'truthy'
  | 'falsy'
  | 'contains'
  | 'matches';

export interface ShowWhenCondition {
  /** Dot-path or formControlName to watch */
  field: string;
  operator: ConditionOperator;
  value?: unknown;
}

export interface ShowWhen {
  conditions: ShowWhenCondition[];
  /** 'and' = all must pass, 'or' = at least one */
  logic?: 'and' | 'or';
}

// ─── Field Attributes ─────────────────────────────────────────────────────────

export interface FieldAttributes {
  inputType: InputType;
  /** HTML input type for text fields (text | email | number | password | url) */
  type?: string;
  disabled?: boolean;
  visible?: boolean;
  isHidden?: boolean;
  value?: unknown;
  /** Whitelist of events to bubble to the parent */
  acceptedEvents?: readonly FormEngineEventType[];
  multiple?: boolean;
  /** Inline info/hint rendered below the field */
  info?: string;

  // ── Select / MultiSelect / Autocomplete ──
  options?: unknown[];
  /** Async options loader token registered via FieldRegistry.registerOptionsLoader */
  optionsLoader?: string;
  /** Re-fetch options when these control values change */
  optionsDependsOn?: string[];
  suggestions?: unknown[];
  optionLabel?: string;
  optionValue?: string;
  optionGroupLabel?: string;
  optionGroupChildren?: string;
  filter?: boolean;
  filterBy?: string;
  filterPlaceholder?: string;
  filterMatchMode?: string;
  filterDelay?: number;
  filterMinLength?: number;
  showClear?: boolean;
  emptyMessage?: string;
  emptyFilterMessage?: string;
  placeholder?: string;
  loading?: boolean;
  loadingIcon?: string;
  virtualScroll?: boolean;
  virtualScrollItemSize?: number;
  scrollHeight?: string;
  lazy?: boolean;
  maxSelectionLimit?: number;
  selectionLimit?: number;
  display?: string;
  group?: boolean;
  dropdown?: boolean;
  dropdownMode?: string;
  forceSelection?: boolean;
  completeOnFocus?: boolean;
  typeahead?: boolean;
  readonly?: boolean;
  minLength?: number;
  delay?: number;

  // ── File Upload ──
  accept?: string;
  maxFileSize?: number;
  chooseLabel?: string;
  chooseIcon?: string;
  isInline?: boolean;
  /** Drag-upload (1.12.0): max number of files. Default 0 = unlimited. */
  fileLimit?: number;
  /** Drag-upload (1.12.0): label on the Upload button. */
  uploadLabel?: string;
  /** Drag-upload (1.12.0): label on the Cancel button. */
  cancelLabel?: string;
  /** Drag-upload (1.12.0): instructional text shown inside the drop zone. */
  dragDropLabel?: string;
  /** Drag-upload (1.12.0): when true, auto-uploads on file selection. Default false. */
  auto?: boolean;

  // ── Button ──
  icon?: string;
  iconPosition?: 'left' | 'right';
  variant?: string;
  text?: boolean;
  rounded?: boolean;
  size?: 'sm' | 'lg' | string;
  /** Submit button subtype: 'submit' | 'reset' | 'cancel' | 'custom' */
  buttonRole?: 'submit' | 'reset' | 'cancel' | 'custom';

  // ── Divider ──
  dividerLayout?: 'horizontal' | 'vertical';
  dividerType?: 'solid' | 'dashed' | 'dotted';
  dividerAlign?: 'left' | 'center' | 'right' | 'top' | 'bottom';

  // ── Input group addon ──
  fieldIcon?: string;
  fieldIconText?: string;
  fieldPos?: 'left' | 'right';

  // ── Toggle card layout ──
  cardLayout?: boolean;
  cardIcon?: string;
  cardIconBg?: string;
  cardIconColor?: string;

  // ── Password ──
  feedback?: boolean;
  toggleMask?: boolean;

  // ── DatePicker ──
  showIcon?: boolean;
  iconDisplay?: string;
  minDate?: Date;
  maxDate?: Date;
  selectionMode?: string;
  readonlyInput?: boolean;
  showButtonBar?: boolean;
  showTime?: boolean;
  hourFormat?: string;
  timeOnly?: boolean;
  view?: string;
  dateFormat?: string;
  numberOfMonths?: number;
  /** Use today as min/max (declarative shortcut so JSON doesn't need to embed Date) */
  minToday?: boolean;
  maxToday?: boolean;
  /** Offset in days from today — combines with min/maxToday */
  minOffsetDays?: number;
  maxOffsetDays?: number;

  // ── Custom Templates ──
  template?: TemplateRef<unknown>;
  templateHeader?: TemplateRef<unknown>;
  templateFooter?: TemplateRef<unknown>;
  inputIconTemplate?: TemplateRef<unknown>;
  dateTemplate?: TemplateRef<unknown>;
  buttonbar?: TemplateRef<unknown>;
  isTemplate?: boolean;

  // ── Textarea ──
  rows?: number;
  cols?: number;
  autoResize?: boolean;

  // ── Slider ──
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  orientation?: 'horizontal' | 'vertical';

  // ── Rating ──
  stars?: number;
  cancel?: boolean;

  // ── Checkbox / Radio ──
  name?: string;
  label?: string;

  // ── Key filter ──
  keyfilter?: 'int' | 'pint' | 'num' | 'pnum' | 'money' | 'hex' | 'email' | 'alpha' | 'alphanum' | string;

  // ── OTP (1.6.0) ──
  /** Number of OTP boxes to render. Defaults to 6. */
  length?: number;
  /** When true, masks each character (treat as a secret). */
  mask?: boolean;
  /** When true, only digits 0–9 are accepted. */
  integerOnly?: boolean;

  // ── Currency / Number (1.7.0) ──
  /** PrimeNG InputNumber mode: 'decimal' (plain) | 'currency'. Used by `currency` field. */
  mode?: 'decimal' | 'currency' | string;
  /** ISO 4217 currency code (e.g. 'USD', 'EUR', 'INR'). Required when mode='currency'. */
  currency?: string;
  /** How to display the currency: 'symbol' (€) | 'code' (EUR) | 'name' (euro). Default 'symbol'. */
  currencyDisplay?: 'symbol' | 'code' | 'name' | string;
  /** BCP 47 locale tag (e.g. 'en-US', 'de-DE', 'ja-JP'). Defaults to the browser locale. */
  locale?: string;
  /** Lower bound of fraction digits. */
  minFractionDigits?: number;
  /** Upper bound of fraction digits. */
  maxFractionDigits?: number;
  /** Use grouping separators (e.g. 1,234,567). Default true. */
  useGrouping?: boolean;
  /** Show +/- spinner buttons. */
  showButtons?: boolean;
  /** Static prefix shown before the value (e.g. '$'). */
  prefix?: string;
  /** Static suffix shown after the value (e.g. ' USD'). */
  suffix?: string;
  /** Permit clearing the value to null/empty. Default true. */
  allowEmpty?: boolean;

  // ── TreeSelect (1.13.0) ──
  /** Tree nodes for `treeSelect`. Shape: `{ key, label, children?, data?, leaf?, ... }`. */
  nodes?: unknown[];
  /** Selection mode for treeSelect. `'single' | 'multiple' | 'checkbox'`. */
  treeSelectionMode?: 'single' | 'multiple' | 'checkbox';
  /** Whether checkbox selection should propagate down to descendants. Default true. */
  propagateSelectionDown?: boolean;
  /** Whether checkbox selection should propagate up to ancestors. Default true. */
  propagateSelectionUp?: boolean;

  // ── Signature pad (1.10.0) ──
  /** Pen stroke color (CSS color string). Defaults to dark grey. */
  penColor?: string;
  /** Pen line width in CSS pixels. Defaults to 2. */
  penWidth?: number;
  /** Canvas height in CSS pixels. Width is responsive. Defaults to 180. */
  height?: number;
  /** Hide the built-in Clear button. */
  hideClearButton?: boolean;
  /** Label on the Clear button. */
  clearLabel?: string;

  // ── tagInput (1.8.0) ──
  /** Separator regex/string that splits typed text into tags (e.g. ',' or `/[,;\s]/`). */
  separator?: string;
  /** Add the current input as a tag on blur (default true for tagInput). */
  addOnBlur?: boolean;
  /** Add the current input as a tag on Tab (default true for tagInput). */
  addOnTab?: boolean;
  /** Reject duplicate tags. Default true. */
  unique?: boolean;

  // ── Color picker ──
  inline?: boolean;

  // ── Confirm password ──
  matchField?: string;

  // ── Dependent dropdown ──
  /** Chain of cascading dropdown configs (each level loads options based on prior selection) */
  cascade?: DependentLevel[];

  // ── Repeater ──
  /** Field definitions used as the row template inside a `repeater` field */
  itemFields?: FormField[];
  /** Min/Max rows for repeater */
  minRows?: number;
  maxRows?: number;
  addLabel?: string;
  removeLabel?: string;

  // ── Group ──
  /** Nested group definition for `group` field type */
  groupFields?: FormField[];

  // ── Extra passthrough for custom adapters ──
  [key: string]: unknown;
}

export interface DependentLevel {
  /** Control suffix for this level (final value will be an object keyed by suffix) */
  key: string;
  label?: string;
  placeholder?: string;
  optionLabel?: string;
  optionValue?: string;
  /** Initial options for the first level; subsequent levels are resolved by `optionsLoader` */
  options?: unknown[];
  /** Loader token for this level, called with parent value(s) */
  optionsLoader?: string;
}

// ─── Field Layout ─────────────────────────────────────────────────────────────

export interface FieldLayout {
  /** PrimeLayout col-N (1–12) */
  columnSpan: number;
  /** Render order within the form grid */
  order?: number;
  /** Additional CSS classes on the wrapper div */
  wrapperClass?: string;
  /** Inline styles on the wrapper div */
  wrapperStyle?: Record<string, string>;
}

// ─── Field Definition ─────────────────────────────────────────────────────────

export interface FormField {
  formControlName?: string;
  label?: string;
  placeholder?: string;
  floatLabel?: boolean;
  floatVariant?: 'on' | 'in' | 'over';
  btnLabel?: string;
  labelIcon?: string;
  labelIconPos?: 'left' | 'right';
  /** Tab navigation order */
  tabIndex?: number;
  /** Mark control value to be excluded from the submit payload */
  transient?: boolean;
  /**
   * Computed field: derived from other controls' values, read-only.
   * `fn` may be either:
   *   - a string token previously registered via
   *     `FieldRegistry.registerComputation(token, fn)`, OR
   *   - a `ComputationFn` defined inline in the JSON / TS schema (added
   *     in 1.1.0; avoids the OnInit registration step for one-off
   *     computations).
   */
  computed?: {
    /** Names of controls whose changes recompute this value */
    deps: string[];
    /** Registry token, or an inline `ComputationFn` */
    fn: string | ComputationFn;
  };
  config: {
    attributes: FieldAttributes;
  };
  validations?: FieldValidations;
  layout?: FieldLayout;
  /** Conditional visibility based on other field values */
  showWhen?: ShowWhen;
  /** Conditional disable based on other field values */
  disableWhen?: ShowWhen;
}

// ─── Wizard Steps ─────────────────────────────────────────────────────────────

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  fields: FormField[];
  /** When false, user can't advance past this step until all step fields are valid */
  skipValidation?: boolean;
}

// ─── Schema Wrapper ───────────────────────────────────────────────────────────

/**
 * The full form definition. Use one of: `fields` (flat), `steps` (wizard).
 */
export interface FormSchema {
  formId?: string;
  title?: string;
  description?: string;
  fields?: FormField[];
  steps?: FormStep[];
  crossFieldValidators?: CrossFieldValidator[];
  /** Storage key for FormPersistenceService */
  persistKey?: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface FormEngineEvent {
  field: FormField;
  values: Record<string, unknown>;
  valid: boolean;
  type: FormEngineEventType;
  /** Raw event from the UI library — type varies by adapter and event type */
  originalEvent?: unknown;
}

// ─── Patch API ────────────────────────────────────────────────────────────────

export interface FormPatchValues {
  [controlName: string]: unknown;
}

// ─── Registry tokens & types ──────────────────────────────────────────────────

export type ComputationFn = (
  deps: Record<string, unknown>,
  formValue: Record<string, unknown>
) => unknown;

export type OptionsLoaderFn = (
  context: Record<string, unknown>,
  formValue: Record<string, unknown>
) => Promise<unknown[]> | unknown[];

export type ValidatorFactory = (
  field: FormField
) => ValidatorFn | AsyncValidatorFn;

/** Public adapter contract — any UI lib adapter implements this. */
export interface FormEngineAdapter {
  /** Component class used to render a flat FormField[] */
  rendererComponent: Type<unknown>;
}

export const FORM_ENGINE_ADAPTER = new InjectionToken<FormEngineAdapter>(
  'FORM_ENGINE_ADAPTER'
);

/** Translation hook — provide your own to localise validation messages. */
export type TranslateFn = (key: string, params?: Record<string, unknown>) => string;
export const FORM_ENGINE_TRANSLATE = new InjectionToken<TranslateFn>(
  'FORM_ENGINE_TRANSLATE'
);

/** Storage adapter for FormPersistenceService */
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export const FORM_ENGINE_STORAGE = new InjectionToken<StorageAdapter>(
  'FORM_ENGINE_STORAGE'
);

/** Helper exposed to custom adapters / templates */
export type ControlPathResolver = (path: string) => unknown;

/** Internal: form context passed to lifecycle hooks */
export interface FormContext {
  formGroup: FormGroup;
  fields: FormField[];
  schema?: FormSchema;
}
