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

import { SignaturePadComponent } from './signature-pad.component';

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
    SignaturePadComponent,
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
   * Resolve the placeholder string to render for a field. Safe for nested
   * fields (repeater itemFields, group groupFields) whose formControlName
   * isn't pre-registered in `placeholderVisibilityMap` — those fall back to
   * the raw `field.placeholder` since they don't participate in floatLabel.
   */
  protected placeholderFor(field: FormField): string | null {
    const name = field.formControlName;
    if (!name) return field.placeholder ?? null;
    const sig = this.placeholderVisibilityMap[name];
    if (!sig) return field.placeholder ?? null;
    return sig() ? (field.placeholder ?? null) : null;
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

    effect(() => {
      this.formService.patchTick();
      if (!this.ready()) return;
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
