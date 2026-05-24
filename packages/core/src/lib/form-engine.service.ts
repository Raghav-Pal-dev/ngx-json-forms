import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

import { AsyncValidatorRegistry } from './async-validator-registry.service';
import { FieldRegistry } from './field-registry.service';
import {
  ConditionOperator,
  CrossFieldValidator,
  FieldValidations,
  FormField,
  FormPatchValues,
  FormSchema,
  FormStep,
  FORM_ENGINE_TRANSLATE,
  ShowWhenCondition,
  TranslateFn,
  ValidationRules,
} from './types';

/**
 * English fallbacks used when no `messages` override is set on a field and
 * no custom TranslateFn is provided. Keeps repeater rows and other
 * untouched fields from rendering raw i18n keys like "form.errors.required".
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  'form.errors.required':  '{label} is required',
  'form.errors.email':     'Enter a valid email address',
  'form.errors.minLength': '{label} must be at least {n} characters',
  'form.errors.maxLength': '{label} must be at most {n} characters',
  'form.errors.min':       '{label} must be ≥ {n}',
  'form.errors.max':       '{label} must be ≤ {n}',
  'form.errors.pattern':   '{label} format is invalid',
  'form.errors.matches':   '{label} must match {target}',
};

@Injectable({ providedIn: 'root' })
export class FormEngineService {
  // ─── Dependencies ────────────────────────────────────────────────────────

  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly validatorRegistry = inject(AsyncValidatorRegistry);
  private readonly translate: TranslateFn = inject(FORM_ENGINE_TRANSLATE, { optional: true })
    ?? ((key: string, params?: Record<string, unknown>) => {
      const fallback = DEFAULT_ERROR_MESSAGES[key];
      const template = fallback ?? key;
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
    });

  // ─── Internal State ──────────────────────────────────────────────────────

  private readonly _formGroup = signal<FormGroup | null>(null);
  private readonly _fields = signal<FormField[]>([]);
  private readonly _schema = signal<FormSchema | null>(null);
  private readonly _activeStepIndex = signal(0);
  readonly _patchTick = signal(0);

  /** Track every subscription created during build so we can tear them down */
  private subs: Subscription[] = [];

  // ─── Public Signals ──────────────────────────────────────────────────────

  readonly formGroup = computed(() => this._formGroup());
  readonly fields = computed(() => this._fields());
  readonly schema = computed(() => this._schema());
  readonly patchTick = computed(() => this._patchTick());
  readonly activeStepIndex = computed(() => this._activeStepIndex());
  readonly steps = computed(() => this._schema()?.steps ?? []);
  readonly activeStep = computed<FormStep | null>(() => {
    const steps = this.steps();
    return steps[this._activeStepIndex()] ?? null;
  });

  readonly formValue = computed(() => {
    this._patchTick();
    return this._formGroup()?.getRawValue() ?? {};
  });

  readonly formValid = computed(() => {
    this._patchTick();
    return this._formGroup()?.valid ?? false;
  });

  // ─── Registration ────────────────────────────────────────────────────────

  /**
   * Bind a freshly built FormGroup to the service. Disposes any previous
   * subscriptions (computed-field listeners, value/status change pumps) so
   * repeated calls during hot schema swaps don't leak.
   */
  register(formGroup: FormGroup, fields: FormField[], schema?: FormSchema): void {
    this.disposeSubs();
    this._formGroup.set(formGroup);
    this._fields.set(fields);
    if (schema) this._schema.set(schema);

    // Bridge native reactive-form changes into the signal world so any
    // consumer reading formValue / formValid recomputes on every keystroke.
    this.subs.push(
      formGroup.valueChanges.subscribe(() => this.bumpPatch()),
      formGroup.statusChanges.subscribe(() => this.bumpPatch())
    );
  }

  clear(): void {
    this.disposeSubs();
    this._formGroup.set(null);
    this._fields.set([]);
    this._schema.set(null);
    this._activeStepIndex.set(0);
  }

  bumpPatch(): void {
    this._patchTick.update((t) => t + 1);
  }

  // ─── Form Builder ────────────────────────────────────────────────────────

  /** Build a FormGroup from a flat FormField[] (groups, repeaters, computed all handled). */
  buildFormGroup(fields: FormField[]): FormGroup {
    const controls: Record<string, AbstractControl> = {};

    for (const field of fields) {
      const ctrl = this.buildControl(field);
      if (ctrl && field.formControlName) {
        controls[field.formControlName] = ctrl;
      }
    }

    return new FormGroup(controls);
  }

  private buildControl(field: FormField): AbstractControl | null {
    const type = field.config.attributes.inputType;
    if (!field.formControlName) return null;
    if (type === 'button' || type === 'staticText' || type === 'divider') return null;

    if (type === 'group') {
      const group = this.buildFormGroup(field.config.attributes.groupFields ?? []);
      return group;
    }

    if (type === 'repeater') {
      // Empty array; rows are added either by `value` (array seed) or by user action
      const seed = (field.config.attributes.value as unknown[] | undefined) ?? [];
      const itemFields = field.config.attributes.itemFields ?? [];
      const arr = new FormArray(seed.map(() => this.buildFormGroup(itemFields)));
      // Apply seed values
      seed.forEach((row, i) => {
        if (row && typeof row === 'object') {
          (arr.at(i) as FormGroup).patchValue(row as Record<string, unknown>);
        }
      });
      return arr;
    }

    const { syncValidators, asyncValidators } = this.buildValidators(field);
    const disabled =
      field.config.attributes.disabled === true || field.computed !== undefined;
    const value = field.config.attributes.value ?? null;

    return new FormControl(
      { value, disabled },
      { validators: syncValidators, asyncValidators }
    );
  }

  private buildValidators(field: FormField): {
    syncValidators: ValidatorFn[];
    asyncValidators: AsyncValidatorFn[];
  } {
    const syncValidators: ValidatorFn[] = [];
    const asyncValidators: AsyncValidatorFn[] = [];
    const rules: ValidationRules = field.validations?.rules ?? {};

    if (rules.required) syncValidators.push(Validators.required);
    if (rules.email) syncValidators.push(Validators.email);
    if (rules.minLength !== undefined) syncValidators.push(Validators.minLength(rules.minLength));
    if (rules.maxLength !== undefined) syncValidators.push(Validators.maxLength(rules.maxLength));
    if (rules.min !== undefined) syncValidators.push(Validators.min(rules.min));
    if (rules.max !== undefined) syncValidators.push(Validators.max(rules.max));
    if (rules.pattern) syncValidators.push(Validators.pattern(rules.pattern));
    if (rules.matches) syncValidators.push(this.makeMatchesValidator(rules.matches));

    for (const token of rules.custom ?? []) {
      const v = this.validatorRegistry.getSync(token);
      if (v) syncValidators.push(v);
    }

    for (const token of field.validations?.asyncValidators ?? []) {
      const v = this.validatorRegistry.getAsync(token);
      if (v) asyncValidators.push(v);
    }

    return { syncValidators, asyncValidators };
  }

  private makeMatchesValidator(targetPath: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control.root as FormGroup | undefined;
      if (!group) return null;
      const target = group.get(targetPath);
      if (!target) return null;
      return target.value === control.value ? null : { matches: { target: targetPath } };
    };
  }

  // ─── Cross-field validators ──────────────────────────────────────────────

  applyCrossFieldValidators(group: FormGroup, validators: CrossFieldValidator[]): void {
    if (!validators.length) return;

    const fn: ValidatorFn = (ctrl) => {
      const value = (ctrl as FormGroup).getRawValue();
      const errors: ValidationErrors = {};
      for (const v of validators) {
        if (!v.validate(value)) {
          errors[`crossField:${v.name}`] = { message: v.message ?? v.name, appliesTo: v.appliesTo };
        }
      }
      return Object.keys(errors).length ? errors : null;
    };
    group.addValidators(fn);
    group.updateValueAndValidity({ emitEvent: false });
  }

  // ─── Computed fields ─────────────────────────────────────────────────────

  /** Wire up reactive computed-field recomputation against the live FormGroup. */
  setupComputedFields(formGroup: FormGroup, fields: FormField[]): void {
    for (const field of fields) {
      if (!field.computed || !field.formControlName) continue;
      const fn = this.fieldRegistry.getComputation(field.computed.fn);
      if (!fn) continue;

      const target = formGroup.get(field.formControlName);
      if (!target) continue;

      const recompute = () => {
        const formValue = formGroup.getRawValue();
        const deps: Record<string, unknown> = {};
        for (const dep of field.computed!.deps) deps[dep] = formValue[dep];
        const next = fn(deps, formValue);
        if (next !== target.value) {
          target.setValue(next, { emitEvent: false });
        }
        this.bumpPatch();
      };

      // Initial pass + subscribe to dep changes
      recompute();
      for (const dep of field.computed.deps) {
        const depCtrl = formGroup.get(dep);
        if (!depCtrl) continue;
        this.subs.push(depCtrl.valueChanges.subscribe(() => recompute()));
      }
    }
  }

  // ─── Dependent dropdown options resolver ─────────────────────────────────

  /**
   * Resolve options for a level of a dependent (cascading) dropdown.
   * Returns either a Promise or the synchronous array.
   */
  async resolveDependentOptions(
    loaderToken: string,
    context: Record<string, unknown>,
    formValue: Record<string, unknown>
  ): Promise<unknown[]> {
    const fn = this.fieldRegistry.getOptionsLoader(loaderToken);
    if (!fn) return [];
    return Promise.resolve(fn(context, formValue));
  }

  // ─── Condition Evaluator ─────────────────────────────────────────────────

  evaluateShowWhen(
    field: Pick<FormField, 'showWhen'>,
    formValues: Record<string, unknown>
  ): boolean {
    if (!field.showWhen) return true;
    const { conditions, logic = 'and' } = field.showWhen;
    const results = conditions.map((c) => this.evalCondition(c, formValues));
    return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  }

  evaluateDisableWhen(
    field: Pick<FormField, 'disableWhen'>,
    formValues: Record<string, unknown>
  ): boolean {
    if (!field.disableWhen) return false;
    const { conditions, logic = 'and' } = field.disableWhen;
    const results = conditions.map((c) => this.evalCondition(c, formValues));
    return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  }

  private evalCondition(c: ShowWhenCondition, values: Record<string, unknown>): boolean {
    const fieldVal = this.getByPath(values, c.field);
    switch (c.operator as ConditionOperator) {
      case 'eq':       return fieldVal === c.value;
      case 'neq':      return fieldVal !== c.value;
      case 'gt':       return (fieldVal as number) > (c.value as number);
      case 'gte':      return (fieldVal as number) >= (c.value as number);
      case 'lt':       return (fieldVal as number) < (c.value as number);
      case 'lte':      return (fieldVal as number) <= (c.value as number);
      case 'in':       return Array.isArray(c.value) && c.value.includes(fieldVal);
      case 'notIn':    return Array.isArray(c.value) && !c.value.includes(fieldVal);
      case 'truthy':   return !!fieldVal;
      case 'falsy':    return !fieldVal;
      case 'contains': return typeof fieldVal === 'string' && fieldVal.includes(String(c.value));
      case 'matches':  return typeof fieldVal === 'string' && new RegExp(String(c.value)).test(fieldVal);
      default:         return true;
    }
  }

  private getByPath(values: Record<string, unknown>, path: string): unknown {
    if (path in values) return values[path];
    return path.split('.').reduce<unknown>(
      (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
      values
    );
  }

  // ─── Error Resolver ──────────────────────────────────────────────────────

  resolveError(field: FormField, control: AbstractControl | null): string | null {
    if (!control || !control.errors || !(control.dirty || control.touched)) return null;
    const messages = field.validations?.messages ?? {};
    const rules = field.validations?.rules;
    const e = control.errors;
    const label = field.label ?? field.formControlName ?? 'Field';

    if (e['required'])  return messages['required']  ?? this.translate('form.errors.required', { label });
    if (e['email'])     return messages['email']     ?? this.translate('form.errors.email', { label });
    if (e['minlength']) return messages['minLength'] ?? this.translate('form.errors.minLength', { label, n: rules?.minLength });
    if (e['maxlength']) return messages['maxLength'] ?? this.translate('form.errors.maxLength', { label, n: rules?.maxLength });
    if (e['min'])       return messages['min']       ?? this.translate('form.errors.min', { label, n: rules?.min });
    if (e['max'])       return messages['max']       ?? this.translate('form.errors.max', { label, n: rules?.max });
    if (e['pattern'])   return messages['pattern']   ?? this.translate('form.errors.pattern', { label });
    if (e['matches'])   return messages['matches']   ?? this.translate('form.errors.matches', { label, target: (e['matches'] as { target: string }).target });

    const customKey = Object.keys(e)[0];
    return messages[customKey] ?? 'Invalid value';
  }

  // ─── Value APIs ──────────────────────────────────────────────────────────

  setValue(controlName: string, value: unknown): void {
    this._formGroup()?.get(controlName)?.setValue(value);
    this.bumpPatch();
  }

  patchValue(values: FormPatchValues): void {
    this._formGroup()?.patchValue(values);
    this.bumpPatch();
  }

  reset(): void {
    this._formGroup()?.reset();
    this.bumpPatch();
  }

  // ─── State APIs ──────────────────────────────────────────────────────────

  enable(controlName: string): void {
    this._formGroup()?.get(controlName)?.enable({ emitEvent: false });
    this.bumpPatch();
  }

  disable(controlName: string): void {
    this._formGroup()?.get(controlName)?.disable({ emitEvent: false });
    this.bumpPatch();
  }

  enableForm(): void {
    this._formGroup()?.enable({ emitEvent: false });
    this.bumpPatch();
  }

  disableForm(): void {
    this._formGroup()?.disable({ emitEvent: false });
    this.bumpPatch();
  }

  // ─── FormArray (repeater) helpers ────────────────────────────────────────

  /** Append a row to a `repeater` control. Returns the new row index. */
  addArrayItem(controlName: string, value?: Record<string, unknown>): number {
    const arr = this._formGroup()?.get(controlName);
    if (!(arr instanceof FormArray)) return -1;

    const field = this._fields().find((f) => f.formControlName === controlName);
    const itemFields = field?.config.attributes.itemFields ?? [];
    const row = this.buildFormGroup(itemFields);
    if (value) row.patchValue(value);
    arr.push(row);
    this.bumpPatch();
    return arr.length - 1;
  }

  removeArrayItem(controlName: string, index: number): void {
    const arr = this._formGroup()?.get(controlName);
    if (!(arr instanceof FormArray)) return;
    arr.removeAt(index);
    this.bumpPatch();
  }

  moveArrayItem(controlName: string, from: number, to: number): void {
    const arr = this._formGroup()?.get(controlName);
    if (!(arr instanceof FormArray)) return;
    if (from === to) return;
    const ctrl = arr.at(from);
    arr.removeAt(from);
    arr.insert(to, ctrl);
    this.bumpPatch();
  }

  // ─── Wizard helpers ──────────────────────────────────────────────────────

  goToStep(index: number): boolean {
    const steps = this.steps();
    if (index < 0 || index >= steps.length) return false;
    this._activeStepIndex.set(index);
    this.bumpPatch();
    return true;
  }

  nextStep(): boolean {
    const i = this._activeStepIndex();
    const steps = this.steps();
    if (i >= steps.length - 1) return false;
    if (!this.validateStep(i)) return false;
    return this.goToStep(i + 1);
  }

  prevStep(): boolean {
    return this.goToStep(this._activeStepIndex() - 1);
  }

  isStepValid(index: number): boolean {
    const step = this.steps()[index];
    if (!step) return true;
    if (step.skipValidation) return true;
    const group = this._formGroup();
    if (!group) return false;
    return step.fields
      .filter((f) => !!f.formControlName)
      .every((f) => group.get(f.formControlName!)?.valid ?? true);
  }

  validateStep(index: number): boolean {
    const step = this.steps()[index];
    if (!step) return true;
    if (step.skipValidation) return true;
    const group = this._formGroup();
    if (!group) return false;
    let valid = true;
    for (const f of step.fields) {
      if (!f.formControlName) continue;
      const c = group.get(f.formControlName);
      if (!c) continue;
      c.markAsTouched();
      if (c.invalid) valid = false;
    }
    this.bumpPatch();
    return valid;
  }

  // ─── Field Metadata APIs ─────────────────────────────────────────────────

  updateFieldAttributes(
    controlName: string,
    attributes: Partial<FormField['config']['attributes']>
  ): void {
    this._fields.update((fields) =>
      fields.map((f) =>
        f.formControlName === controlName
          ? { ...f, config: { ...f.config, attributes: { ...f.config.attributes, ...attributes } } }
          : f
      )
    );
    this.bumpPatch();
  }

  updateFieldValidations(controlName: string, validations: Partial<FieldValidations>): void {
    this._fields.update((fields) =>
      fields.map((f) =>
        f.formControlName === controlName
          ? {
              ...f,
              validations: {
                ...f.validations,
                ...validations,
                rules: { ...f.validations?.rules, ...validations.rules },
                messages: { ...f.validations?.messages, ...validations.messages },
              },
            }
          : f
      )
    );

    // Re-apply validators on the live control too
    const field = this._fields().find((f) => f.formControlName === controlName);
    const control = this._formGroup()?.get(controlName);
    if (field && control) {
      const { syncValidators, asyncValidators } = this.buildValidators(field);
      control.setValidators(syncValidators);
      control.setAsyncValidators(asyncValidators);
      control.updateValueAndValidity({ emitEvent: false });
    }
    this.bumpPatch();
  }

  addField(field: FormField, atIndex?: number): void {
    this._fields.update((fields) => {
      const next = [...fields];
      if (atIndex !== undefined) {
        next.splice(atIndex, 0, field);
      } else {
        next.push(field);
      }
      return next;
    });

    if (field.formControlName) {
      const ctrl = this.buildControl(field);
      if (ctrl) this._formGroup()?.addControl(field.formControlName, ctrl);
    }
    this.bumpPatch();
  }

  removeField(controlName: string): void {
    this._fields.update((fields) => fields.filter((f) => f.formControlName !== controlName));
    this._formGroup()?.removeControl(controlName);
    this.bumpPatch();
  }

  // ─── Focus & DOM Actions ─────────────────────────────────────────────────

  checkError(controlName: string): void {
    queueMicrotask(() => {
      const el = document.querySelector<HTMLElement>(`[id="${controlName}Id"]`);
      el?.focus();
      el?.blur();
      this.bumpPatch();
    });
  }

  focusField(controlName: string): void {
    queueMicrotask(() => {
      document.querySelector<HTMLElement>(`[id="${controlName}Id"]`)?.focus();
    });
  }

  // ─── Validation Helpers ──────────────────────────────────────────────────

  markAllAsTouchedAndValidate(): boolean {
    this._formGroup()?.markAllAsTouched();
    this.bumpPatch();
    return this._formGroup()?.valid ?? false;
  }

  /** Strip `transient` controls from a snapshot so the submit payload stays clean. */
  buildSubmitPayload(): Record<string, unknown> {
    const value = this._formGroup()?.getRawValue() ?? {};
    const transient = new Set(
      this._fields().filter((f) => f.transient).map((f) => f.formControlName!)
    );
    if (!transient.size) return value;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value)) if (!transient.has(k)) out[k] = value[k];
    return out;
  }

  // ─── Read APIs ───────────────────────────────────────────────────────────

  getControl(path: string): AbstractControl | null {
    return this._formGroup()?.get(path) ?? null;
  }

  getFormState(): Record<string, unknown> {
    return this._formGroup()?.getRawValue() ?? {};
  }

  getFormValid(): boolean {
    return this._formGroup()?.valid ?? false;
  }

  getFormControls(): Record<string, AbstractControl> {
    return this._formGroup()?.controls ?? {};
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  private disposeSubs(): void {
    for (const s of this.subs) s.unsubscribe();
    this.subs = [];
  }
}
