import { CrossFieldValidator, FormField } from './types';

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

  /**
   * Free-form chip / token input. Typing then pressing Enter (or the
   * configured separator) commits the text as a chip; clicking the
   * chip's X removes it. The form value is a plain `string[]` — no
   * `{label, value}` wrapping. Backed by PrimeNG `<p-autocomplete
   * multiple typeahead="false">` since `<p-chips>` was removed in v21.
   *
   * Use cases: tags, keywords, emails-to-invite, allowlist domains.
   *
   * @example
   *   presets.tagInput({ formControlName: 'tags', label: 'Tags' });
   *   presets.tagInput({
   *     formControlName: 'invitees',
   *     label: 'Invitees',
   *     placeholder: 'jane@acme.com, john@acme.com',
   *     separator: ',',
   *   });
   *
   * @since 1.8.0
   */
  tagInput(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    /** Char/regex string that auto-commits when typed (e.g. ','). */
    separator?: string;
    /** Reject duplicate tags. Defaults true. */
    unique?: boolean;
    /** Commit current input as a tag on blur. Defaults true. */
    addOnBlur?: boolean;
    /** Commit current input as a tag on Tab. Defaults true. */
    addOnTab?: boolean;
    required?: boolean;
    /** Minimum number of tags required (uses minLength on the array). */
    minTags?: number;
    /** Maximum number of tags allowed (uses maxLength on the array). */
    maxTags?: number;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'tagInput',
          separator: opts.separator,
          unique: opts.unique ?? true,
          addOnBlur: opts.addOnBlur ?? true,
          addOnTab: opts.addOnTab ?? true,
          acceptedEvents: ['add', 'remove', 'change', 'blur'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
          ...(opts.minTags !== undefined ? { minLength: opts.minTags } : {}),
          ...(opts.maxTags !== undefined ? { maxLength: opts.maxTags } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Range date-picker (PrimeNG `<p-datepicker selectionMode="range">`).
   * Bound value is `[Date, Date | null]` — a tuple where the second
   * entry is `null` while the user is mid-selection. Use cases:
   * check-in / check-out, report period, billing window.
   *
   * Defaults: 2 calendars side-by-side, button bar (Today / Clear),
   * format `mm/dd/yy`, no min/max bounds. Set `minToday: true` for
   * "no past dates"; pass `dateFormat` to override the display
   * (e.g. `'yy-mm-dd'` for ISO-style).
   *
   * @example
   *   presets.dateRange({ formControlName: 'stay', label: 'Stay' });
   *   presets.dateRange({
   *     formControlName: 'period',
   *     label: 'Reporting period',
   *     dateFormat: 'yy-mm-dd',
   *     minToday: true,
   *   });
   *
   * @since 1.9.0
   */
  dateRange(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    /** Display format. PrimeNG syntax — `dd/mm/yy`, `yy-mm-dd`, etc. */
    dateFormat?: string;
    /** Use today as min date (no past selections). */
    minToday?: boolean;
    /** Use today as max date (no future selections). */
    maxToday?: boolean;
    /** Offset in days from today for the minimum date. */
    minOffsetDays?: number;
    /** Offset in days from today for the maximum date. */
    maxOffsetDays?: number;
    /** Number of side-by-side calendars. Defaults to 2. */
    numberOfMonths?: number;
    /** Show the Today / Clear bar at the bottom. Defaults to true. */
    showButtonBar?: boolean;
    /** Show the calendar icon next to the input. Defaults to true. */
    showIcon?: boolean;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? '',
      config: {
        attributes: {
          inputType: 'datePicker',
          selectionMode: 'range',
          numberOfMonths: opts.numberOfMonths ?? 2,
          showButtonBar: opts.showButtonBar ?? true,
          showIcon: opts.showIcon ?? true,
          dateFormat: opts.dateFormat,
          minToday: opts.minToday,
          maxToday: opts.maxToday,
          minOffsetDays: opts.minOffsetDays,
          maxOffsetDays: opts.maxOffsetDays,
          acceptedEvents: ['select', 'change', 'blur', 'clear'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Cross-field validator: end-date must come *after* (or on the same
   * day as, if `strict: false`) the start-date. Drop into your
   * `FormSchema.crossFieldValidators` array.
   *
   * Works with `presets.dateRange()` (single control holding a tuple)
   * OR with two separate date controls (pass `endControlName`).
   *
   * @example
   * const schema: FormSchema = {
   *   fields: [
   *     presets.dateRange({ formControlName: 'stay', label: 'Stay' }),
   *   ],
   *   crossFieldValidators: [
   *     presets.endAfterStart({ formControlName: 'stay' }),
   *   ],
   * };
   *
   * @since 1.9.0
   */
  endAfterStart(opts: {
    /** Range control name (value: [Date, Date|null]) — for single-control mode. */
    formControlName?: string;
    /** Start control name — for two-control mode. */
    startControlName?: string;
    /** End control name — for two-control mode. */
    endControlName?: string;
    /** Error key (defaults to 'endAfterStart'). */
    name?: string;
    /** Require end > start (default). When false, end >= start is allowed. */
    strict?: boolean;
    message?: string;
  }): CrossFieldValidator {
    const name = opts.name ?? 'endAfterStart';
    const strict = opts.strict ?? true;
    const message = opts.message ?? 'End date must be after start date';
    return {
      name,
      message,
      appliesTo: opts.formControlName
        ? [opts.formControlName]
        : [opts.startControlName!, opts.endControlName!].filter(Boolean),
      validate: (value) => {
        let start: unknown, end: unknown;
        if (opts.formControlName) {
          const tuple = value[opts.formControlName];
          if (!Array.isArray(tuple)) return true; // not yet populated
          [start, end] = tuple as [unknown, unknown];
        } else {
          start = value[opts.startControlName!];
          end = value[opts.endControlName!];
        }
        // If either side is missing, defer judgement — required validators handle "missing".
        if (start == null || end == null) return true;
        const s = start instanceof Date ? start.getTime() : new Date(start as string).getTime();
        const e = end instanceof Date ? end.getTime() : new Date(end as string).getTime();
        if (Number.isNaN(s) || Number.isNaN(e)) return true;
        return strict ? e > s : e >= s;
      },
    };
  },

  /**
   * Canvas-backed signature pad. Form value is a PNG data URL
   * (`data:image/png;base64,...`) while there's a signature; `null`
   * when empty / cleared. That makes it trivially persistable and
   * previewable — `<img [src]="value">` just works.
   *
   * Use cases: consent / waiver / contract signing, delivery receipts,
   * approval workflows.
   *
   * @example
   *   presets.signature({ formControlName: 'consent', label: 'Sign here' });
   *   presets.signature({
   *     formControlName: 'approval',
   *     label: 'Manager approval',
   *     penColor: '#1d4ed8',
   *     penWidth: 3,
   *     height: 220,
   *     required: true,
   *   });
   *
   * @since 1.10.0
   */
  signature(opts: {
    formControlName: string;
    label?: string;
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
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      config: {
        attributes: {
          inputType: 'signature',
          penColor: opts.penColor ?? '#111827',
          penWidth: opts.penWidth ?? 2,
          height: opts.height ?? 180,
          hideClearButton: opts.hideClearButton ?? false,
          clearLabel: opts.clearLabel ?? 'Clear',
          acceptedEvents: ['change', 'blur', 'clear'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Composite address field — a nested `group` with line1 / line2 /
   * city / state / postalCode / country sub-fields, each pre-wired
   * with sensible labels, layout, and validation.
   *
   * Form value shape:
   * ```ts
   * {
   *   <formControlName>: {
   *     line1: string;
   *     line2: string;
   *     city: string;
   *     state: string;
   *     postalCode: string;
   *     country: string;   // ISO 3166-1 alpha-2 code by default
   *   }
   * }
   * ```
   *
   * The default country list is a curated set of common destinations
   * (US, CA, GB, AU, NZ, IN, DE, FR, ES, IT, JP, BR, MX, SG). Pass
   * `countries: [{ label, value }, ...]` to override; pass
   * `countries: []` to render a plain text input for country.
   *
   * To skip a sub-field entirely, pass `include: { line2: false }`.
   *
   * @example
   *   presets.address({ formControlName: 'shipping', label: 'Shipping address' });
   *   presets.address({
   *     formControlName: 'billing',
   *     label: 'Billing address',
   *     include: { line2: false, state: false },
   *     countries: [{ label: 'India', value: 'IN' }],
   *   });
   *
   * @since 1.11.0
   */
  address(opts: {
    formControlName: string;
    label?: string;
    /** Customise the country dropdown options; defaults to a common set. */
    countries?: { label: string; value: string }[];
    /** Selectively hide sub-fields (all default to included). */
    include?: Partial<{
      line1: boolean;
      line2: boolean;
      city: boolean;
      state: boolean;
      postalCode: boolean;
      country: boolean;
    }>;
    /** Per-sub-field required overrides (all required by default except line2). */
    required?: Partial<{
      line1: boolean;
      line2: boolean;
      city: boolean;
      state: boolean;
      postalCode: boolean;
      country: boolean;
    }>;
    columnSpan?: number;
  }): FormField {
    const include = {
      line1: true, line2: true, city: true, state: true,
      postalCode: true, country: true,
      ...opts.include,
    };
    const required = {
      line1: true, line2: false, city: true, state: true,
      postalCode: true, country: true,
      ...opts.required,
    };
    const countries: { label: string; value: string }[] = opts.countries ?? [
      { label: 'United States',  value: 'US' },
      { label: 'Canada',         value: 'CA' },
      { label: 'United Kingdom', value: 'GB' },
      { label: 'Australia',      value: 'AU' },
      { label: 'New Zealand',    value: 'NZ' },
      { label: 'India',          value: 'IN' },
      { label: 'Germany',        value: 'DE' },
      { label: 'France',         value: 'FR' },
      { label: 'Spain',          value: 'ES' },
      { label: 'Italy',          value: 'IT' },
      { label: 'Japan',          value: 'JP' },
      { label: 'Brazil',         value: 'BR' },
      { label: 'Mexico',         value: 'MX' },
      { label: 'Singapore',      value: 'SG' },
    ];

    const groupFields: FormField[] = [];
    if (include.line1) {
      groupFields.push({
        formControlName: 'line1',
        label: 'Street address',
        placeholder: '123 Main St',
        config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
        validations: { rules: { ...(required.line1 ? { required: true } : {}) } },
        layout: { columnSpan: 12 },
      });
    }
    if (include.line2) {
      groupFields.push({
        formControlName: 'line2',
        label: 'Apt / Suite / Unit',
        placeholder: 'Apt 4B',
        config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
        validations: { rules: { ...(required.line2 ? { required: true } : {}) } },
        layout: { columnSpan: 12 },
      });
    }
    if (include.city) {
      groupFields.push({
        formControlName: 'city',
        label: 'City',
        config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
        validations: { rules: { ...(required.city ? { required: true } : {}) } },
        layout: { columnSpan: 6 },
      });
    }
    if (include.state) {
      groupFields.push({
        formControlName: 'state',
        label: 'State / Province',
        config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
        validations: { rules: { ...(required.state ? { required: true } : {}) } },
        layout: { columnSpan: 6 },
      });
    }
    if (include.postalCode) {
      groupFields.push({
        formControlName: 'postalCode',
        label: 'Postal code',
        config: { attributes: { inputType: 'text', acceptedEvents: ['change', 'blur'] } },
        validations: {
          rules: {
            ...(required.postalCode ? { required: true } : {}),
            // Permissive — covers US (5 or 5-4), CA (A1A 1A1), UK, IN, etc.
            // Tighten per-country in the consuming app if you need it.
            pattern: '^[A-Za-z0-9][A-Za-z0-9\\-\\s]{2,9}[A-Za-z0-9]$',
          },
          messages: { pattern: 'Enter a valid postal code' },
        },
        layout: { columnSpan: 6 },
      });
    }
    if (include.country) {
      // If the consumer explicitly passes `countries: []`, fall back
      // to a plain text input — they want free-form country entry.
      const asSelect = countries.length > 0;
      groupFields.push({
        formControlName: 'country',
        label: 'Country',
        config: {
          attributes: asSelect
            ? {
                inputType: 'select',
                options: countries,
                optionLabel: 'label',
                optionValue: 'value',
                placeholder: 'Select country',
                showClear: false,
                filter: true,
                acceptedEvents: ['change', 'blur'],
              }
            : {
                inputType: 'text',
                acceptedEvents: ['change', 'blur'],
              },
        },
        validations: { rules: { ...(required.country ? { required: true } : {}) } },
        layout: { columnSpan: 6 },
      });
    }

    return {
      formControlName: opts.formControlName,
      label: opts.label,
      config: {
        attributes: {
          inputType: 'group',
          groupFields,
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Drag-and-drop file zone (`<p-fileUpload mode="advanced">`).
   * Renders a proper dropzone with file queue, per-file remove,
   * and Upload / Cancel buttons. The `uploadHandler` event fires
   * with `{ files: File[] }` — wire it to your `(formChange)` /
   * `(formSubmit)` handler and POST the files yourself.
   *
   * Defaults: multiple files, accept everything, 5 MB per file, no
   * file-count limit, manual upload (no `auto`).
   *
   * @example
   *   presets.dragUpload({ formControlName: 'attachments' });
   *   presets.dragUpload({
   *     formControlName: 'avatar',
   *     label: 'Avatar',
   *     accept: 'image/*',
   *     multiple: false,
   *     maxFileSize: 1024 * 1024 * 2,
   *     auto: true,
   *   });
   *
   * @since 1.12.0
   */
  dragUpload(opts: {
    formControlName: string;
    label?: string;
    /** Allow multiple files. Defaults to true. */
    multiple?: boolean;
    /** MIME / file-extension allowlist (e.g. 'image/*' or '.pdf,.docx'). Defaults to all files. */
    accept?: string;
    /** Max size per file in bytes. Defaults to 5 MB. */
    maxFileSize?: number;
    /** Max total number of files. `0` = unlimited (default). */
    fileLimit?: number;
    /** Auto-upload on file selection. Defaults to false. */
    auto?: boolean;
    chooseLabel?: string;
    uploadLabel?: string;
    cancelLabel?: string;
    dragDropLabel?: string;
    chooseIcon?: string;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      config: {
        attributes: {
          inputType: 'dragUpload',
          multiple: opts.multiple ?? true,
          accept: opts.accept ?? '*/*',
          maxFileSize: opts.maxFileSize ?? 5 * 1024 * 1024,
          fileLimit: opts.fileLimit ?? 0,
          auto: opts.auto ?? false,
          chooseLabel: opts.chooseLabel ?? 'Choose',
          uploadLabel: opts.uploadLabel ?? 'Upload',
          cancelLabel: opts.cancelLabel ?? 'Cancel',
          dragDropLabel: opts.dragDropLabel ?? 'Drag and drop files here to upload',
          chooseIcon: opts.chooseIcon ?? 'pi pi-folder-open',
          acceptedEvents: ['uploadHandler', 'select', 'remove', 'clear', 'change'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Hierarchical multi-select (`<p-treeSelect>`). Use for nested
   * taxonomies — categories, org charts, locations, file folders,
   * permissions trees.
   *
   * `nodes` shape (PrimeNG `TreeNode[]`):
   * ```ts
   * [{ key: '1', label: 'Sales', children: [
   *     { key: '1-0', label: 'North America' },
   *     { key: '1-1', label: 'EMEA' },
   *   ]
   * }]
   * ```
   *
   * Value type depends on `mode`:
   *   - `'single'`   → `TreeNode | null`
   *   - `'multiple'` → `TreeNode[]`
   *   - `'checkbox'` → `{ [key]: { checked, partialChecked } }`
   *
   * @example
   *   presets.treeSelect({ formControlName: 'category', label: 'Category', nodes });
   *   presets.treeSelect({
   *     formControlName: 'permissions',
   *     label: 'Permissions',
   *     mode: 'checkbox',
   *     nodes,
   *     filter: true,
   *   });
   *
   * @since 1.13.0
   */
  treeSelect(opts: {
    formControlName: string;
    label?: string;
    /** `TreeNode[]`. Each node: `{ key, label, children?, data? }`. */
    nodes: unknown[];
    /** Selection mode. Defaults to `'single'`. */
    mode?: 'single' | 'multiple' | 'checkbox';
    placeholder?: string;
    /** Show a filter input above the tree. Default false. */
    filter?: boolean;
    filterBy?: string;
    filterPlaceholder?: string;
    showClear?: boolean;
    /** Checkbox mode: propagate selection down to children. Default true. */
    propagateSelectionDown?: boolean;
    /** Checkbox mode: propagate selection up to ancestors. Default true. */
    propagateSelectionUp?: boolean;
    /** Display compact value list as comma-separated labels ('comma') or chips. */
    display?: 'comma' | 'chip';
    scrollHeight?: string;
    emptyMessage?: string;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? 'Select',
      config: {
        attributes: {
          inputType: 'treeSelect',
          nodes: opts.nodes,
          treeSelectionMode: opts.mode ?? 'single',
          filter: opts.filter ?? false,
          filterBy: opts.filterBy ?? 'label',
          filterPlaceholder: opts.filterPlaceholder ?? 'Search',
          showClear: opts.showClear ?? false,
          propagateSelectionDown: opts.propagateSelectionDown ?? true,
          propagateSelectionUp: opts.propagateSelectionUp ?? true,
          display: opts.display ?? 'comma',
          scrollHeight: opts.scrollHeight ?? '300px',
          emptyMessage: opts.emptyMessage ?? 'No options',
          acceptedEvents: ['select', 'unselect', 'clear', 'change', 'blur'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Appointment-style time-slot picker. Renders a button grid of
   * server-provided times — single-pick (default) or multi-pick.
   *
   * Slots can be plain `string[]` (`['09:00', '09:30']`) or the
   * richer `{ value, label?, disabled? }[]` shape so servers can
   * mark already-booked slots as disabled without removing them.
   *
   * Value:
   *   - `multiple: false` → `string | null`
   *   - `multiple: true`  → `string[]`
   *
   * @example
   *   presets.timeSlots({
   *     formControlName: 'appointment',
   *     label: 'Pick a time',
   *     slots: ['09:00', '09:30', '10:00', '10:30', '11:00'],
   *   });
   *
   *   // Multi-slot picker with one already taken:
   *   presets.timeSlots({
   *     formControlName: 'sessions',
   *     multiple: true,
   *     slots: [
   *       { value: 'mon-9am', label: 'Mon 9 AM' },
   *       { value: 'tue-9am', label: 'Tue 9 AM', disabled: true },
   *       { value: 'wed-9am', label: 'Wed 9 AM' },
   *     ],
   *   });
   *
   * @since 1.14.0
   */
  timeSlots(opts: {
    formControlName: string;
    label?: string;
    slots: (string | { value: string; label?: string; disabled?: boolean })[];
    /** Allow picking multiple slots. Defaults to false. */
    multiple?: boolean;
    /** Severity for the *selected* button(s). Defaults to `'primary'`. */
    selectedSeverity?: string;
    /** Severity for unselected buttons (outlined). Defaults to `'secondary'`. */
    unselectedSeverity?: string;
    /** Message shown when `slots` is empty. */
    emptyMessage?: string;
    required?: boolean;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      config: {
        attributes: {
          inputType: 'timeSlots',
          slots: opts.slots,
          multiple: opts.multiple ?? false,
          selectedSeverity: opts.selectedSeverity ?? 'primary',
          unselectedSeverity: opts.unselectedSeverity ?? 'secondary',
          emptyMessage: opts.emptyMessage ?? 'No slots available',
          acceptedEvents: ['change', 'blur'],
        },
      },
      validations: {
        rules: {
          ...(opts.required ? { required: true } : {}),
        },
      },
      layout: { columnSpan: opts.columnSpan ?? 12 },
    };
  },

  /**
   * Markdown editor with live preview. Wraps the
   * `<ngx-markdown-editor>` component which dynamic-imports the
   * `marked` library on first render.
   *
   * **Requires the `marked` peer dep**: `npm install marked`.
   * Without it the preview pane shows an install hint instead of
   * rendered HTML; the editor textarea still works for value
   * capture.
   *
   * Layouts:
   *   - `'split'`   — textarea + preview side-by-side (default)
   *   - `'editor'`  — textarea only
   *   - `'preview'` — preview only (read-only render)
   *
   * @example
   *   presets.markdown({ formControlName: 'bio', label: 'Bio' });
   *   presets.markdown({
   *     formControlName: 'readme',
   *     label: 'README',
   *     layout: 'split',
   *     rows: 12,
   *   });
   *
   * @since 1.15.0
   */
  markdown(opts: {
    formControlName: string;
    label?: string;
    placeholder?: string;
    /** Layout. Defaults to 'split'. */
    layout?: 'split' | 'editor' | 'preview';
    /** Textarea row count. Defaults to 8. */
    rows?: number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    columnSpan?: number;
  }): FormField {
    return {
      formControlName: opts.formControlName,
      label: opts.label,
      placeholder: opts.placeholder ?? 'Write markdown…',
      config: {
        attributes: {
          inputType: 'markdown',
          mdLayout: opts.layout ?? 'split',
          rows: opts.rows ?? 8,
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
