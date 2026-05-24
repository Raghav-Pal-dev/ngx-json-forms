import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import {
  FormEngineEvent,
  FormEngineService,
  FormSchema,
} from '@ngx-json-forms/core';

import { NgxJsonFormComponent } from './ngx-form-engine-primeng.component';

/**
 * Wizard-style wrapper that drives `<ngx-json-form>` step-by-step using the
 * `FormSchema.steps` definition. Renders a header strip with step indicators,
 * the current step's fields, and Back / Next / Submit controls.
 */
@Component({
  selector: 'ngx-json-form-stepper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxJsonFormComponent, ButtonModule, NgClass],
  styleUrl: './ngx-json-form-stepper.component.scss',
  template: `
    @if (schema().steps?.length) {
      <div class="ngx-stepper">
        <!-- Step indicators -->
        <ol class="ngx-stepper-bar">
          @for (step of schema().steps; track step.id) {
            <li
              class="ngx-stepper-item"
              [ngClass]="{
                active: $index === activeIndex(),
                done: $index < activeIndex()
              }"
              (click)="jumpTo($index)"
            >
              <span class="ngx-stepper-num">
                @if ($index < activeIndex()) {
                  <i class="pi pi-check"></i>
                } @else {
                  {{ $index + 1 }}
                }
              </span>
              <span class="ngx-stepper-label">
                @if (step.icon) {
                  <i [class]="step.icon"></i>
                }
                {{ step.title }}
              </span>
            </li>
          }
        </ol>

        <!--
          Step body — resolve the active step from the schema INPUT (not
          from formService.activeStep()) so the inner <ngx-json-form>
          always renders. formService.activeStep() only becomes non-null
          AFTER the inner form calls register(), which only happens once
          the inner form is in the DOM; gating on activeStep() created a
          chicken-and-egg that left the body permanently blank.
        -->
        @let currentStep = schema().steps?.[activeIndex()];
        @if (currentStep?.description) {
          <p class="ngx-stepper-desc">{{ currentStep!.description }}</p>
        }
        <ngx-json-form
          [schema]="schema()"
          [stepFields]="currentStep?.fields ?? []"
          (formChange)="formChange.emit($event)"
          (formSubmit)="onSubmit($event)"
        />

        <!-- Controls -->
        <div class="ngx-stepper-actions">
          <button
            pButton
            type="button"
            class="p-button-text"
            label="Back"
            icon="pi pi-arrow-left"
            [disabled]="activeIndex() === 0"
            (click)="back()"
          ></button>
          @if (!isLast()) {
            <button
              pButton
              type="button"
              label="Next"
              icon="pi pi-arrow-right"
              iconPos="right"
              (click)="next()"
            ></button>
          } @else {
            <button
              pButton
              type="button"
              [label]="submitLabel()"
              icon="pi pi-check"
              iconPos="right"
              [disabled]="!formService.formValid()"
              (click)="submit()"
            ></button>
          }
        </div>
      </div>
    }
  `,
})
export class NgxJsonFormStepperComponent {
  readonly schema = input.required<FormSchema>();
  readonly submitLabel = input<string>('Submit');

  readonly formSubmit = output<FormEngineEvent>();
  readonly formChange = output<FormEngineEvent>();

  protected readonly formService = inject(FormEngineService);

  readonly activeIndex = computed(() => this.formService.activeStepIndex());
  readonly activeStep = computed(() => this.formService.activeStep());

  readonly isLast = computed(() => {
    const steps = this.schema().steps ?? [];
    return this.activeIndex() === steps.length - 1;
  });

  constructor() {
    // Reset the wizard whenever the schema input changes
    effect(() => {
      this.schema();
      this.formService.goToStep(0);
    });
  }

  protected back(): void {
    this.formService.prevStep();
  }

  protected next(): void {
    this.formService.nextStep();
  }

  protected jumpTo(i: number): void {
    if (i <= this.activeIndex()) this.formService.goToStep(i);
  }

  protected submit(): void {
    if (!this.formService.markAllAsTouchedAndValidate()) return;
    const values = this.formService.buildSubmitPayload();
    this.formSubmit.emit({
      field: { config: { attributes: { inputType: 'button', buttonRole: 'submit' } } } as never,
      values,
      valid: true,
      type: 'submit',
    });
  }

  /** Pass-through when the inner form emits formSubmit (e.g. via an inline button) */
  protected onSubmit(e: FormEngineEvent): void {
    this.formSubmit.emit(e);
  }
}
