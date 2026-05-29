import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  Type,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgComponentOutlet, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Subscription } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { SliderModule } from 'primeng/slider';
import { RatingModule } from 'primeng/rating';
import { ColorPickerModule } from 'primeng/colorpicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { KeyFilterModule } from 'primeng/keyfilter';
import { EditorModule } from 'primeng/editor';
import { InputOtpModule } from 'primeng/inputotp';
import { InputNumberModule } from 'primeng/inputnumber';
import { TreeSelectModule } from 'primeng/treeselect';

import { SignaturePadComponent } from './signature-pad.component';
import { TimeSlotsComponent } from './time-slots.component';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { CaptchaComponent } from './captcha.component';
import { ImageCropComponent } from './image-crop.component';
import { PhoneInputComponent } from './phone-input.component';
import { CodeEditorComponent } from './code-editor.component';

import {
  FieldRegistry,
  FormEngineEvent,
  FormEngineEventType,
  FormEngineService,
  FormField,
  FormPersistenceService,
  FormSchema,
  ImageUploadService,
} from '@ngx-json-forms/core';

@Component({
  selector: 'ngx-json-form',
  templateUrl: './ngx-form-engine-primeng.component.html',
  styleUrl: './ngx-form-engine-primeng.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    NgComponentOutlet,
    NgOptimizedImage,
    // PrimeNG
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FloatLabelModule,
    SelectModule,
    MultiSelectModule,
    CascadeSelectModule,
    AutoCompleteModule,
    FileUploadModule,
    ButtonModule,
    DialogModule,
    DividerModule,
    PasswordModule,
    DatePickerModule,
    CheckboxModule,
    ToggleSwitchModule,
    TextareaModule,
    SliderModule,
    RatingModule,
    ColorPickerModule,
    RadioButtonModule,
    KeyFilterModule,
    EditorModule,
    InputOtpModule,
    InputNumberModule,
    TreeSelectModule,
    SignaturePadComponent,
    TimeSlotsComponent,
    MarkdownEditorComponent,
    CaptchaComponent,
    ImageCropComponent,
    PhoneInputComponent,
    CodeEditorComponent,
  ],
})
export class NgxJsonFormComponent {
  // ─── Inputs / Outputs ────────────────────────────────────────────────────

  readonly formTitle = input<string>('');
  readonly fieldsInput = input<FormField[]>([]);
  /** Optional schema input — supersedes `fieldsInput` when provided. */
  readonly schema = input<FormSchema | null>(null);
  /** Only render fields in the given step indices (used by the stepper wrapper). */
  readonly stepFields = input<FormField[] | null>(null);

  readonly formSubmit = output<FormEngineEvent>();
  readonly formChange = output<FormEngineEvent>();

  // ─── Services ────────────────────────────────────────────────────────────

  protected readonly formService = inject(FormEngineService);
  protected readonly uploadService = inject(ImageUploadService);
  protected readonly fieldRegistry = inject(FieldRegistry);
  protected readonly persistence = inject(FormPersistenceService);

  /** Unbind fn returned by FormPersistenceService.bind(), if a persistKey is active. */
  private unbindPersistence: (() => void) | null = null;

  // ─── Internal State ──────────────────────────────────────────────────────

  readonly fields = signal<FormField[]>([]);
  readonly formGroup = signal<FormGroup>(new FormGroup({}));
  readonly ready = signal(false);

  /** Async-loaded options keyed by formControlName */
  readonly asyncOptions = signal<Record<string, unknown[]>>({});

  private readonly formStatusTick = signal(0);
  private readonly focusedMap = signal<Record<string, boolean>>({});

  /** Subscriptions for async option re-loads; disposed on every rebuild. */
  private optionLoaderSubs: Subscription[] = [];

  /**
   * Snapshot of the original `suggestions` array for each autocomplete field.
   * Auto-populated on the first `completeMethod` event so that subsequent
   * client-side filtering doesn't shrink the source list. Keyed by form
   * control name.
   *
   * F31: without this, an autocomplete with a static `suggestions: string[]`
   * would never filter as the user types — PrimeNG's API expects the consumer
   * to mutate `suggestions` in response to `completeMethod`, but if no handler
   * does that the spinner runs forever and the panel stays stale.
   */
  private autocompleteSourceMap = new Map<string, unknown[]>();

  // ─── Derived ─────────────────────────────────────────────────────────────

  readonly visibleFields = computed(() => {
    this.formStatusTick();
    this.formService.patchTick();
    const values = this.formGroup().getRawValue();
    const source = this.stepFields() ?? this.fields();
    return source.filter((f) => {
      if (f.config.attributes.visible === false) return false;
      return this.formService.evaluateShowWhen(f, values);
    });
  });

  /**
   * Track patchTick so .valid (a plain object property) re-reads after every
   * form change. Without this, the submit-button disabled binding stays stuck
   * on the FormGroup's initial (invalid) state.
   */
  readonly formValid = computed(() => {
    this.formService.patchTick();
    this.formStatusTick();
    return this.formGroup().valid;
  });

  protected placeholderVisibilityMap: Record<string, ReturnType<typeof computed>> = {};

  /**
   * The placeholder string for a field, regardless of where the consumer
   * declared it. Historically some field types read `field.placeholder`
   * (top-level, what the presets set) and others read
   * `field.config.attributes.placeholder`. Checking both means a placeholder
   * shows up no matter which spot the consumer used. (F38)
   */
  private placeholderText(field: FormField): string | null {
    return field.placeholder ?? field.config.attributes.placeholder ?? null;
  }

  /**
   * Resolve the placeholder string to render for a field. Safe for nested
   * fields (repeater itemFields, group groupFields) whose formControlName
   * isn't pre-registered in `placeholderVisibilityMap` — those fall back to
   * the raw placeholder text since they don't participate in floatLabel.
   */
  protected placeholderFor(field: FormField): string | null {
    const text = this.placeholderText(field);
    const name = field.formControlName;
    if (!name) return text;
    const sig = this.placeholderVisibilityMap[name];
    if (!sig) return text;
    return sig() ? text : null;
  }

  readonly errorMap = computed(() => {
    this.formStatusTick();
    this.formService.patchTick();
    const errors: Record<string, string | null> = {};
    const group = this.formGroup();
    if (!group) return errors;
    for (const field of this.fields()) {
      if (!field.formControlName) continue;
      const control = group.get(field.formControlName);
      errors[field.formControlName] = this.formService.resolveError(field, control);
    }
    return errors;
  });

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  constructor() {
    effect(() => {
      this.ready.set(false);

      const schemaIn = this.schema();
      const incoming: FormField[] = schemaIn?.fields
        ? schemaIn.fields
        : schemaIn?.steps
          ? schemaIn.steps.flatMap((s) => s.fields)
          : this.fieldsInput();

      if (!incoming.length) return;

      const sorted = [...incoming].sort((a, b) => {
        const oa = a.layout?.order ?? Number.MAX_SAFE_INTEGER;
        const ob = b.layout?.order ?? Number.MAX_SAFE_INTEGER;
        return oa - ob;
      });

      this.fields.set(sorted);
      this.buildForm(sorted, schemaIn ?? undefined);
    });

    /**
     * Re-sync from the service when external code mutates fields via
     * `updateFieldAttributes()` etc. — but ONLY when this component is
     * the active one in the singleton service. Without this gate two
     * `<ngx-json-form>` instances on the same page would clobber each
     * other: form B's register() updates service.fields() and form A's
     * effect would then overwrite its local fields with B's. (See QA
     * pass: multi-form collision was the root of L3/L5/U5.)
     */
    effect(() => {
      this.formService.patchTick();
      if (!this.ready()) return;
      if (this.formService.formGroup() !== this.formGroup()) return;
      this.fields.set(this.formService.fields());
      this.uploadService.syncPreviews(this.fields(), this.formGroup());
    });
  }

  // ─── Form Builder ────────────────────────────────────────────────────────

  private buildForm(fields: FormField[], schema?: FormSchema): void {
    // Tear down anything tied to the previous form group before we rebuild.
    this.disposeOptionLoaderSubs();
    this.placeholderVisibilityMap = {};
    this.unbindPersistence?.();
    this.unbindPersistence = null;

    const group = this.formService.buildFormGroup(fields);
    this.formGroup.set(group);

    // Register synchronously so prior subs are disposed BEFORE we add new
    // computed-field listeners below — otherwise register() would wipe them.
    this.formService.register(group, fields, schema);

    // Auto-save / restore: when the schema declares a persistKey, bind the
    // FormGroup to FormPersistenceService. Restore happens inside bind();
    // subsequent value changes flow back to the storage adapter
    // automatically. (Added in 1.2.0.)
    if (schema?.persistKey) {
      this.unbindPersistence = this.persistence.bind(group, schema.persistKey);
    }

    for (const field of fields) {
      if (!field.formControlName) continue;
      this.placeholderVisibilityMap[field.formControlName] = computed(() => {
        if (!field.floatLabel) return true;
        const control = this.formGroup()?.get(field.formControlName!);
        if (!control) return false;
        const v = control.value;
        const hasValue =
          v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0);
        return this.focusedMap()[field.formControlName!] === true && !hasValue;
      });
    }

    if (schema?.crossFieldValidators?.length) {
      this.formService.applyCrossFieldValidators(group, schema.crossFieldValidators);
    }
    this.formService.setupComputedFields(group, fields);

    // Bootstrap async options for select-like fields
    for (const f of fields) {
      const a = f.config.attributes;
      if (a.optionsLoader && f.formControlName) {
        void this.loadAsyncOptions(f);
        for (const dep of a.optionsDependsOn ?? []) {
          const depCtrl = group.get(dep);
          if (!depCtrl) continue;
          this.optionLoaderSubs.push(
            depCtrl.valueChanges.subscribe(() => void this.loadAsyncOptions(f))
          );
        }
      }
    }

    queueMicrotask(() => {
      this.ready.set(true);
      this.uploadService.syncPreviews(this.fields(), this.formGroup());
    });
  }

  private disposeOptionLoaderSubs(): void {
    for (const s of this.optionLoaderSubs) s.unsubscribe();
    this.optionLoaderSubs = [];
  }

  private async loadAsyncOptions(field: FormField): Promise<void> {
    const a = field.config.attributes;
    if (!a.optionsLoader || !field.formControlName) return;
    const formValue = this.formGroup().getRawValue();
    const context: Record<string, unknown> = {};
    for (const dep of a.optionsDependsOn ?? []) context[dep] = formValue[dep];

    this.formService.updateFieldAttributes(field.formControlName, { loading: true });
    const opts = await this.formService.resolveDependentOptions(a.optionsLoader, context, formValue);
    this.asyncOptions.update((m) => ({ ...m, [field.formControlName!]: opts }));
    this.formService.updateFieldAttributes(field.formControlName, { loading: false, options: opts });
  }

  /**
   * Atomic / self-styled controls shouldn't be wrapped in the full-width
   * `<p-inputgroup>` chrome that plain text inputs use. The template adds a
   * `.ngx-field-atomic` class to the inner div when this returns true; the
   * SCSS strips the inputgroup chrome under that class.
   *
   * Two categories:
   *   1. Small atomic controls (toggle/checkbox/radio/slider/rating/colorPicker)
   *      that have their own intrinsic dimensions.
   *   2. Composite fields with their own visual chrome (otp, tagInput,
   *      signature, dragUpload, imageCrop, treeSelect, timeSlots, markdown,
   *      code, phoneIntl, captcha) — wrapping these in inputgroup produces
   *      a stray light "outer box" around the field.
   *
   * (We use a class instead of `:has(p-toggleswitch)` because Angular's
   * emulated-CSS compiler strips `:has(...)` selectors combined with
   * `::ng-deep`.)
   */
  protected isAtomicControl(field: FormField): boolean {
    const t = field.config.attributes.inputType;
    return (
      // Small atomic controls
      t === 'toggle' || t === 'checkbox' || t === 'radio' ||
      t === 'slider' || t === 'rating' || t === 'colorPicker' ||
      // Self-styled composite fields (added F19)
      t === 'otp' || t === 'tagInput' || t === 'signature' ||
      t === 'dragUpload' || t === 'imageCrop' || t === 'treeSelect' ||
      t === 'timeSlots' || t === 'markdown' || t === 'code' ||
      t === 'phoneIntl' || t === 'captcha' || t === 'currency' ||
      // F36: autocomplete is a complete PrimeNG widget — its input already
      // has a border and the dropdown button joins it. Wrapping it in our
      // inputgroup produced a double border + pushed the chevron to a new
      // row. Treat it as self-styled so PrimeNG's native layout stands.
      t === 'autocomplete'
    );
  }

  // Normalize the `accept` attribute for <p-fileUpload>. PrimeNG's internal
  // validator treats the literal universal-wildcard string (star slash star)
  // as a MIME type to match: it splits on the slash and compares each half,
  // so any real file fails validation with "Invalid file type, allowed
  // file types: ...". The HTML spec says an empty/omitted `accept` means
  // no restriction — so we map the universal wildcard (and empty/whitespace)
  // to `null` to bypass PrimeNG's check.
  //
  // F33: previously the dragUpload default was the universal wildcard, which
  // made every drop fail until the consumer explicitly listed every MIME type.
  // (Block comment, not JSDoc — JSDoc closes on the slash-star sequence.)
  protected acceptForUpload(raw: string | undefined | null): string | undefined {
    const v = (raw ?? '').trim();
    if (!v || v === '*/*' || v === '*') return undefined;
    return v;
  }

  // ─── Field Registry resolver (used by custom inputType) ──────────────────

  protected customRenderer(field: FormField): Type<unknown> | undefined {
    return this.fieldRegistry.getRenderer(field.config.attributes.inputType);
  }

  protected customRendererInputs(field: FormField): Record<string, unknown> {
    return { field, formGroup: this.formGroup() };
  }

  // ─── Date helpers ────────────────────────────────────────────────────────

  protected minDateFor(field: FormField): Date | undefined {
    const a = field.config.attributes;
    if (a.minDate) return a.minDate;
    if (a.minToday) {
      const d = new Date();
      d.setDate(d.getDate() + (a.minOffsetDays ?? 0));
      return d;
    }
    return undefined;
  }

  protected maxDateFor(field: FormField): Date | undefined {
    const a = field.config.attributes;
    if (a.maxDate) return a.maxDate;
    if (a.maxToday) {
      const d = new Date();
      d.setDate(d.getDate() + (a.maxOffsetDays ?? 0));
      return d;
    }
    return undefined;
  }

  // ─── Effective options resolver ──────────────────────────────────────────

  protected optionsFor(field: FormField): unknown[] {
    const a = field.config.attributes;
    if (field.formControlName && this.asyncOptions()[field.formControlName]) {
      return this.asyncOptions()[field.formControlName];
    }
    return (a.options as unknown[]) ?? [];
  }

  // ─── Repeater helpers ────────────────────────────────────────────────────

  protected getArray(name: string): FormArray | null {
    const c = this.formGroup().get(name);
    return c instanceof FormArray ? c : null;
  }

  protected addRepeaterRow(field: FormField): void {
    if (!field.formControlName) return;
    const arr = this.getArray(field.formControlName);
    if (!arr) return;
    if (field.config.attributes.maxRows && arr.length >= field.config.attributes.maxRows) return;
    this.formService.addArrayItem(field.formControlName);
    this.triggerTick();
  }

  protected removeRepeaterRow(field: FormField, i: number): void {
    if (!field.formControlName) return;
    const arr = this.getArray(field.formControlName);
    if (!arr) return;
    if (field.config.attributes.minRows && arr.length <= field.config.attributes.minRows) return;
    this.formService.removeArrayItem(field.formControlName, i);
    this.triggerTick();
  }

  protected rowGroup(field: FormField, i: number): FormGroup {
    return this.getArray(field.formControlName!)?.at(i) as FormGroup;
  }

  /**
   * DOM id for a field's input element. Scoped by row index when the field
   * lives inside a repeater so the same `formControlName` across rows
   * doesn't produce duplicate ids (HTML spec violation + breaks
   * <label for>, aria-describedby, and document.querySelector lookups).
   */
  protected inputId(field: FormField, suffix?: number | string): string {
    const base = (field.formControlName ?? '') + 'Id';
    return suffix !== undefined && suffix !== null ? `${base}_${suffix}` : base;
  }

  /**
   * Resolve the validation message for a single field inside a repeater row.
   * Mirrors errorMap() but for FormGroup rows that aren't tracked in the
   * top-level fields signal.
   */
  protected resolveRowError(row: FormGroup, sub: FormField): string | null {
    this.formService.patchTick();
    if (!sub.formControlName) return null;
    const ctrl = row.get(sub.formControlName);
    return this.formService.resolveError(sub, ctrl);
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  /** Central event handler. Accepts `unknown` because PrimeNG emits custom event objects. */
  async onEvent(field: FormField, event: unknown, eventType?: FormEngineEventType): Promise<void> {
    this.triggerTick();

    const rawType = eventType ?? ((event as Event)?.type as FormEngineEventType);
    let type = rawType;

    if (type === 'focus')
      this.focusedMap.update((m) => ({ ...m, [field.formControlName!]: true }));
    if (type === 'blur')
      this.focusedMap.update((m) => ({ ...m, [field.formControlName!]: false }));

    if (type === 'uploadHandler') {
      await this.uploadService.handleUpload(
        field,
        event as { files: File[] },
        this.formGroup(),
        this.formService,
        () => this.emitChange(field, 'uploadHandler', event)
      );
      return;
    }

    // F31: default client-side filter for static `suggestions` arrays. Runs
    // before the acceptedEvents gate so the panel filters even if the
    // consumer never listed 'complete' in acceptedEvents. Consumers needing
    // async lookups can opt out by setting `attributes.staticFilter: false`
    // and handling the event themselves.
    if (
      type === 'complete' &&
      field.config.attributes.inputType === 'autocomplete' &&
      field.config.attributes['staticFilter'] !== false
    ) {
      const fcn = field.formControlName!;
      if (!this.autocompleteSourceMap.has(fcn)) {
        this.autocompleteSourceMap.set(
          fcn,
          [...((field.config.attributes.suggestions as unknown[]) ?? [])],
        );
      }
      const source = this.autocompleteSourceMap.get(fcn) ?? [];
      const q = String((event as { query?: string }).query ?? '').toLowerCase();
      const labelKey = field.config.attributes.optionLabel ?? 'label';
      // F37: ALWAYS return a fresh array (note the `[...source]` for the empty-
      // query branch). PrimeNG's `suggestions` is a setter that resets its
      // `loading` flag via handleSuggestionsChange() — but Angular only invokes
      // the setter when the bound value changes by reference (===). Returning
      // the same `source` reference on a repeat dropdown-click (empty query)
      // meant the setter never fired, so PrimeNG's spinner got stuck on after
      // a few clicks. A new array reference every time guarantees the reset.
      const filtered = q
        ? source.filter((item) => {
            const label = typeof item === 'string'
              ? item
              : (item as Record<string, unknown>)[labelKey];
            return String(label ?? '').toLowerCase().includes(q);
          })
        : [...source];
      this.formService.updateFieldAttributes(fcn, { suggestions: filtered });
    }

    if (type === 'inputKeydown' && field.config.attributes.inputType === 'autocomplete') {
      const ke = event as KeyboardEvent;
      if (ke.key === 'Enter') {
        const inputValue = (ke.target as HTMLInputElement).value?.trim();
        if (inputValue) {
          const tag = {
            [field.config.attributes.optionLabel!]: inputValue,
            [field.config.attributes.optionValue!]: inputValue,
          };
          const existing = [...((field.config.attributes.suggestions as unknown[]) ?? []), tag];
          this.formService.updateFieldAttributes(field.formControlName!, { suggestions: existing });
          this.formGroup().get(field.formControlName!)?.setValue(existing);
          type = 'add';
        }
      }
    }

    if (type === 'unselect' && field.config.attributes.inputType === 'autocomplete') {
      const evtValue = (event as { value: unknown }).value;
      const remaining = ((field.config.attributes.suggestions as unknown[]) ?? []).filter(
        (v) => evtValue !== v
      );
      this.formService.updateFieldAttributes(field.formControlName!, { suggestions: remaining });
      this.formGroup().get(field.formControlName!)?.setValue(remaining);
    }

    // A button with buttonRole === 'submit' / 'reset' / 'cancel' / 'custom'
    // should fire its action whether or not 'click' was explicitly listed
    // in acceptedEvents — leaving it off is the most common cause of
    // "my submit button does nothing" support tickets. (Added 1.1.0.)
    const isButtonClick = type === 'click' && field.config.attributes.inputType === 'button';
    const allowed = field.config.attributes.acceptedEvents ?? [];
    if (!isButtonClick && !allowed.includes(type)) return;

    const payload = this.buildPayload(field, type, event);

    if (type === 'click') {
      const role = field.config.attributes.buttonRole;
      if (role === 'reset') {
        this.formService.reset();
        this.formChange.emit(payload);
        return;
      }
      if (role === 'cancel' || role === 'custom') {
        this.formChange.emit(payload);
        return;
      }
      if (!this.formValid()) this.formGroup().markAllAsTouched();
      this.formSubmit.emit({ ...payload, values: this.formService.buildSubmitPayload() });
    } else {
      this.formChange.emit(payload);
    }
  }

  removeImage(field: FormField, image: string): void {
    this.uploadService.removeImage(
      field,
      image,
      this.formGroup(),
      this.formService,
      () => this.emitChange(field, 'uploadHandler', new Event('remove'))
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private buildPayload(field: FormField, type: FormEngineEventType, originalEvent: unknown): FormEngineEvent {
    return {
      field,
      values: this.formGroup().getRawValue(),
      valid: this.formValid(),
      type,
      originalEvent,
    };
  }

  private emitChange(field: FormField, type: FormEngineEventType, event: unknown): void {
    this.formChange.emit(this.buildPayload(field, type, event));
  }

  private triggerTick(): void {
    this.formStatusTick.update((v) => v + 1);
  }

  protected getControl(name: string): FormControl {
    return this.formGroup().get(name) as FormControl;
  }
}
