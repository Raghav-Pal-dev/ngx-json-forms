import { FormField } from './types';

/**
 * Lightweight factory helpers for the field types you reach for most
 * often. They return a partial-but-complete `FormField` with sensible
 * defaults; spread your own overrides on top.
 *
 * @example
 * const fields: FormField[] = [
 *   presets.email({ formControlName: 'workEmail', label: 'Work email' }),
 *   presets.password({ formControlName: 'pwd', label: 'Password', strong: true }),
 *   presets.phone({ formControlName: 'mobile', label: 'Mobile' }),
 *   presets.text({  formControlName: 'firstName', label: 'First name', minLength: 2 }),
 * ];
 *
 * Every preset is just a function — feel free to fork one if your defaults
 * differ. Nothing here is magic.
 */
export const presets = {
  /** Email input with `email` validator + sensible acceptedEvents. */
  email(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? 'name@example.com',
      config: {
        attributes: {
          inputType: 'text',
          type: 'email',
          fieldIcon: 'pi pi-envelope',
          fieldPos: 'left',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: { required: opts.required ?? true, email: true },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /** Password input with PrimeNG strength meter + toggle-mask. */
  password(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    strong?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'password',
          feedback: opts.strong ?? false,
          toggleMask: true,
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          required: opts.required ?? true,
          minLength: opts.minLength ?? 8,
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /** Phone input — digits only, sane min-length, tel input mode. */
  phone(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    minDigits?: number;
    columnSpan?: number;
  }): FormField {
    const min = opts.minDigits ?? 7;
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'text',
          type: 'tel',
          keyfilter: 'int',
          fieldIcon: 'pi pi-phone',
          fieldPos: 'left',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          required: opts.required ?? true,
          pattern: `^[0-9]{${min},}$`,
        },
        messages: {
          pattern: `At least ${min} digits`,
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /** Plain text input with optional length bounds. */
  text(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'text',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
          ...(opts.minLength !== undefined ? { minLength: opts.minLength } : {}),
          ...(opts.maxLength !== undefined ? { maxLength: opts.maxLength } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * One-Time-Password input (PrimeNG `<p-inputotp>`). Sensible defaults:
   * 6 digit-only boxes, required, pattern matches the chosen length.
   * Tweak `length`, `mask`, `integerOnly` to suit (e.g. an 8-character
   * alphanumeric backup code: `presets.otp({ length: 8, integerOnly: false })`).
   *
   * @since 1.6.0
   */
  otp(opts: {
    formControlName: string;
    label?: string;
    /** Number of OTP cells. Defaults to 6. */
    length?: number;
    /** Mask each character (treat as a secret). Defaults to false. */
    mask?: boolean;
    /** Only allow digits 0–9. Defaults to true. */
    integerOnly?: boolean;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    const length = opts.length ?? 6;
    const integerOnly = opts.integerOnly ?? true;
    const pattern = integerOnly ? `^[0-9]{${length}}$` : `^.{${length}}$`;
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      config: {
        attributes: {
          inputType: 'otp',
          length,
          mask: opts.mask ?? false,
          integerOnly,
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          required: opts.required ?? true,
          pattern,
        },
        messages: {
          pattern: `Enter all ${length} ${integerOnly ? 'digits' : 'characters'}`,
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Localised currency input (PrimeNG `<p-inputnumber mode="currency">`).
   * Defaults to USD with `en-US` locale, 2 fraction digits, min 0, no
   * max. Pass `currency: 'EUR' | 'INR' | ...` (ISO 4217) and `locale:
   * 'de-DE' | 'ja-JP' | ...` (BCP 47) to localise the symbol and
   * grouping separators.
   *
   * @example
   *   presets.currency({ formControlName: 'price', label: 'Price', currency: 'USD' });
   *   presets.currency({ formControlName: 'amount', currency: 'INR', locale: 'en-IN' });
   *   presets.currency({ formControlName: 'fees', currency: 'JPY', maxFractionDigits: 0 });
   *
   * @since 1.7.0
   */
  currency(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    /** ISO 4217 currency code. Defaults to 'USD'. */
    currency?: string;
    /** BCP 47 locale tag. Defaults to 'en-US'. */
    locale?: string;
    /** Symbol style. Defaults to 'symbol'. */
    currencyDisplay?: 'symbol' | 'code' | 'name';
    min?: number;
    max?: number;
    /** Fraction-digit lower bound. Defaults to 2. */
    minFractionDigits?: number;
    /** Fraction-digit upper bound. Defaults to 2. */
    maxFractionDigits?: number;
    /** Show +/- spinner buttons. Defaults to false. */
    showButtons?: boolean;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    const min = opts.min ?? 0;
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'currency',
          mode: 'currency',
          currency: opts.currency ?? 'USD',
          locale: opts.locale ?? 'en-US',
          currencyDisplay: opts.currencyDisplay ?? 'symbol',
          min,
          ...(opts.max !== undefined ? { max: opts.max } : {}),
          minFractionDigits: opts.minFractionDigits ?? 2,
          maxFractionDigits: opts.maxFractionDigits ?? 2,
          showButtons: opts.showButtons ?? false,
          useGrouping: true,
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          required: opts.required ?? true,
          min,
          ...(opts.max !== undefined ? { max: opts.max } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /** Submit button with sensible defaults. */
  submit(opts: { formControlName?: string; label?: string; columnSpan?: number } = {}): FormField {
    return {
      formControlName: opts.formControlName ?? 'submitBtn',
      btnLabel: opts.label ?? 'Submit',
      config: {
        attributes: {
          inputType: 'button',
          buttonRole: 'submit',
          icon: 'pi pi-arrow-right',
          iconPosition: 'right',
          acceptedEvents: ['click'],
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 4 },
    };
  },
};
