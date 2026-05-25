import { presets } from './presets';

describe('presets', () => {
  describe('otp (1.6.0)', () => {
    it('defaults to 6 integer-only cells, required + matching pattern', () => {
      const f = presets.otp({ formControlName: 'code' });
      expect(f.config.attributes.inputType).toBe('otp');
      expect(f.config.attributes.length).toBe(6);
      expect(f.config.attributes.integerOnly).toBe(true);
      expect(f.config.attributes.mask).toBe(false);
      expect(f.validations?.rules?.required).toBe(true);
      expect(f.validations?.rules?.pattern).toBe('^[0-9]{6}$');
    });

    it('honours custom length + alphanumeric mode', () => {
      const f = presets.otp({
        formControlName: 'backup',
        length: 8,
        integerOnly: false,
      });
      expect(f.config.attributes.length).toBe(8);
      expect(f.config.attributes.integerOnly).toBe(false);
      expect(f.validations?.rules?.pattern).toBe('^.{8}$');
      // Pattern message reflects the chosen mode.
      expect(f.validations?.messages?.pattern).toContain('characters');
    });

    it('supports mask=true for secret codes', () => {
      const f = presets.otp({ formControlName: 'pin', mask: true, length: 4 });
      expect(f.config.attributes.mask).toBe(true);
      expect(f.validations?.rules?.pattern).toBe('^[0-9]{4}$');
      expect(f.validations?.messages?.pattern).toContain('4');
    });

    it('respects required=false (still validates pattern if value is non-empty)', () => {
      const f = presets.otp({ formControlName: 'code', required: false });
      expect(f.validations?.rules?.required).toBe(false);
      expect(f.validations?.rules?.pattern).toBeDefined();
    });
  });

  describe('currency (1.7.0)', () => {
    it('defaults to USD / en-US / 2 fraction digits / min 0', () => {
      const f = presets.currency({ formControlName: 'price' });
      expect(f.config.attributes.inputType).toBe('currency');
      expect(f.config.attributes.mode).toBe('currency');
      expect(f.config.attributes.currency).toBe('USD');
      expect(f.config.attributes.locale).toBe('en-US');
      expect(f.config.attributes.currencyDisplay).toBe('symbol');
      expect(f.config.attributes.minFractionDigits).toBe(2);
      expect(f.config.attributes.maxFractionDigits).toBe(2);
      expect(f.config.attributes.min).toBe(0);
      expect(f.validations?.rules?.min).toBe(0);
      expect(f.validations?.rules?.required).toBe(true);
    });

    it('honours a foreign currency + locale (e.g. INR / en-IN)', () => {
      const f = presets.currency({
        formControlName: 'amount',
        currency: 'INR',
        locale: 'en-IN',
      });
      expect(f.config.attributes.currency).toBe('INR');
      expect(f.config.attributes.locale).toBe('en-IN');
    });

    it('drops fraction digits for zero-decimal currencies (JPY)', () => {
      const f = presets.currency({
        formControlName: 'fee',
        currency: 'JPY',
        locale: 'ja-JP',
        minFractionDigits: 0,
        maxFractionDigits: 0,
      });
      expect(f.config.attributes.minFractionDigits).toBe(0);
      expect(f.config.attributes.maxFractionDigits).toBe(0);
    });

    it('passes max bound through to both attributes and validator', () => {
      const f = presets.currency({ formControlName: 'cap', max: 10000 });
      expect(f.config.attributes.max).toBe(10000);
      expect(f.validations?.rules?.max).toBe(10000);
    });

    it('emits change + blur events by default', () => {
      const f = presets.currency({ formControlName: 'p' });
      expect(f.config.attributes.acceptedEvents).toEqual(['change', 'blur']);
    });
  });

  describe('tagInput (1.8.0)', () => {
    it('defaults: unique, addOnBlur, addOnTab, accepts add/remove/blur events', () => {
      const f = presets.tagInput({ formControlName: 'tags' });
      expect(f.config.attributes.inputType).toBe('tagInput');
      expect(f.config.attributes.unique).toBe(true);
      expect(f.config.attributes.addOnBlur).toBe(true);
      expect(f.config.attributes.addOnTab).toBe(true);
      expect(f.config.attributes.acceptedEvents).toContain('add');
      expect(f.config.attributes.acceptedEvents).toContain('remove');
    });

    it('honours separator + non-unique', () => {
      const f = presets.tagInput({
        formControlName: 'tags',
        separator: ',',
        unique: false,
      });
      expect(f.config.attributes.separator).toBe(',');
      expect(f.config.attributes.unique).toBe(false);
    });

    it('maps minTags / maxTags to minLength / maxLength validators', () => {
      const f = presets.tagInput({
        formControlName: 'invitees',
        minTags: 1,
        maxTags: 10,
      });
      expect(f.validations?.rules?.minLength).toBe(1);
      expect(f.validations?.rules?.maxLength).toBe(10);
    });

    it('omits required when not asked (opt-in)', () => {
      const f = presets.tagInput({ formControlName: 'tags' });
      expect(f.validations?.rules?.required).toBeUndefined();
    });

    it('adds required when requested', () => {
      const f = presets.tagInput({ formControlName: 'tags', required: true });
      expect(f.validations?.rules?.required).toBe(true);
    });
  });

  describe('dateRange (1.9.0)', () => {
    it('produces a datePicker with selectionMode=range + 2 calendars + button bar', () => {
      const f = presets.dateRange({ formControlName: 'stay' });
      expect(f.config.attributes.inputType).toBe('datePicker');
      expect(f.config.attributes.selectionMode).toBe('range');
      expect(f.config.attributes.numberOfMonths).toBe(2);
      expect(f.config.attributes.showButtonBar).toBe(true);
      expect(f.config.attributes.showIcon).toBe(true);
    });

    it('honours minToday + custom dateFormat', () => {
      const f = presets.dateRange({
        formControlName: 'period',
        minToday: true,
        dateFormat: 'yy-mm-dd',
      });
      expect(f.config.attributes.minToday).toBe(true);
      expect(f.config.attributes.dateFormat).toBe('yy-mm-dd');
    });

    it('omits required by default (range often optional)', () => {
      const f = presets.dateRange({ formControlName: 'stay' });
      expect(f.validations?.rules?.required).toBeUndefined();
    });
  });

  describe('endAfterStart (1.9.0)', () => {
    it('returns true (passes) when range tuple is empty / mid-selection', () => {
      const v = presets.endAfterStart({ formControlName: 'stay' });
      expect(v.validate({ stay: [] })).toBe(true);
      const start = new Date('2026-06-01');
      expect(v.validate({ stay: [start, null] })).toBe(true);
    });

    it('returns true (passes) when end is strictly after start', () => {
      const v = presets.endAfterStart({ formControlName: 'stay' });
      const start = new Date('2026-06-01');
      const end = new Date('2026-06-05');
      expect(v.validate({ stay: [start, end] })).toBe(true);
    });

    it('returns false (fails) when end equals start under strict (default)', () => {
      const v = presets.endAfterStart({ formControlName: 'stay' });
      const d = new Date('2026-06-01');
      expect(v.validate({ stay: [d, d] })).toBe(false);
    });

    it('returns true when end equals start under strict=false', () => {
      const v = presets.endAfterStart({ formControlName: 'stay', strict: false });
      const d = new Date('2026-06-01');
      expect(v.validate({ stay: [d, d] })).toBe(true);
    });

    it('supports two-control mode with startControlName + endControlName', () => {
      const v = presets.endAfterStart({
        startControlName: 'start',
        endControlName: 'end',
      });
      expect(v.appliesTo).toEqual(['start', 'end']);
      expect(v.validate({ start: '2026-06-01', end: '2026-06-05' })).toBe(true);
      expect(v.validate({ start: '2026-06-05', end: '2026-06-01' })).toBe(false);
    });

    it('passes (defers) when a side is null/undefined — required validators handle missing', () => {
      const v = presets.endAfterStart({
        startControlName: 'start',
        endControlName: 'end',
      });
      expect(v.validate({ start: null, end: '2026-06-05' })).toBe(true);
      expect(v.validate({ start: '2026-06-01', end: undefined })).toBe(true);
    });
  });

  describe('signature (1.10.0)', () => {
    it('emits inputType=signature with sensible defaults', () => {
      const f = presets.signature({ formControlName: 'sig' });
      expect(f.config.attributes.inputType).toBe('signature');
      expect(f.config.attributes.penColor).toBe('#111827');
      expect(f.config.attributes.penWidth).toBe(2);
      expect(f.config.attributes.height).toBe(180);
      expect(f.config.attributes.hideClearButton).toBe(false);
      expect(f.config.attributes.acceptedEvents).toContain('change');
      expect(f.config.attributes.acceptedEvents).toContain('clear');
    });

    it('honours custom pen + height + hideClearButton', () => {
      const f = presets.signature({
        formControlName: 'sig',
        penColor: '#1d4ed8',
        penWidth: 3,
        height: 240,
        hideClearButton: true,
      });
      expect(f.config.attributes.penColor).toBe('#1d4ed8');
      expect(f.config.attributes.penWidth).toBe(3);
      expect(f.config.attributes.height).toBe(240);
      expect(f.config.attributes.hideClearButton).toBe(true);
    });

    it('omits required by default; adds when requested', () => {
      expect(presets.signature({ formControlName: 's' }).validations?.rules?.required).toBeUndefined();
      expect(presets.signature({ formControlName: 's', required: true }).validations?.rules?.required).toBe(true);
    });
  });

  describe('address (1.11.0)', () => {
    it('produces a group with 6 sub-fields by default', () => {
      const f = presets.address({ formControlName: 'shipping' });
      expect(f.config.attributes.inputType).toBe('group');
      const sub = f.config.attributes.groupFields ?? [];
      expect(sub.map((s) => s.formControlName)).toEqual([
        'line1', 'line2', 'city', 'state', 'postalCode', 'country',
      ]);
    });

    it('makes everything except line2 required by default', () => {
      const sub = presets.address({ formControlName: 'a' }).config.attributes.groupFields ?? [];
      const reqOf = (name: string) =>
        sub.find((s) => s.formControlName === name)?.validations?.rules?.required;
      expect(reqOf('line1')).toBe(true);
      expect(reqOf('line2')).toBeUndefined();
      expect(reqOf('city')).toBe(true);
      expect(reqOf('state')).toBe(true);
      expect(reqOf('postalCode')).toBe(true);
      expect(reqOf('country')).toBe(true);
    });

    it('honours include={ line2: false, state: false }', () => {
      const f = presets.address({
        formControlName: 'a',
        include: { line2: false, state: false },
      });
      const names = (f.config.attributes.groupFields ?? []).map((s) => s.formControlName);
      expect(names).toEqual(['line1', 'city', 'postalCode', 'country']);
    });

    it('renders country as a select with the default country list', () => {
      const sub = presets.address({ formControlName: 'a' }).config.attributes.groupFields ?? [];
      const country = sub.find((s) => s.formControlName === 'country')!;
      expect(country.config.attributes.inputType).toBe('select');
      expect((country.config.attributes.options as unknown[]).length).toBeGreaterThan(5);
      const us = (country.config.attributes.options as { value: string }[]).find((o) => o.value === 'US');
      expect(us).toBeDefined();
    });

    it('falls back to text input when countries=[] (free-form)', () => {
      const f = presets.address({ formControlName: 'a', countries: [] });
      const country = (f.config.attributes.groupFields ?? []).find((s) => s.formControlName === 'country')!;
      expect(country.config.attributes.inputType).toBe('text');
      expect(country.config.attributes.options).toBeUndefined();
    });

    it('postalCode validates a permissive cross-country pattern', () => {
      const sub = presets.address({ formControlName: 'a' }).config.attributes.groupFields ?? [];
      const postal = sub.find((s) => s.formControlName === 'postalCode')!;
      const re = new RegExp(postal.validations!.rules!.pattern!);
      expect(re.test('94103')).toBe(true);       // US ZIP
      expect(re.test('94103-1234')).toBe(true);  // US ZIP+4
      expect(re.test('K1A 0B1')).toBe(true);     // CA
      expect(re.test('SW1A 1AA')).toBe(true);    // UK
      expect(re.test('110001')).toBe(true);      // IN
      expect(re.test('!')).toBe(false);          // garbage
    });

    it('per-field required overrides work (postalCode optional)', () => {
      const sub = presets.address({
        formControlName: 'a',
        required: { postalCode: false },
      }).config.attributes.groupFields ?? [];
      const postal = sub.find((s) => s.formControlName === 'postalCode')!;
      expect(postal.validations?.rules?.required).toBeUndefined();
    });
  });

  describe('dragUpload (1.12.0)', () => {
    it('produces dragUpload renderer with multi-file defaults', () => {
      const f = presets.dragUpload({ formControlName: 'attachments' });
      expect(f.config.attributes.inputType).toBe('dragUpload');
      expect(f.config.attributes.multiple).toBe(true);
      expect(f.config.attributes.accept).toBe('*/*');
      expect(f.config.attributes.maxFileSize).toBe(5 * 1024 * 1024);
      expect(f.config.attributes.fileLimit).toBe(0);
      expect(f.config.attributes.auto).toBe(false);
      expect(f.config.attributes.acceptedEvents).toContain('uploadHandler');
    });

    it('honours single-image-only avatar config', () => {
      const f = presets.dragUpload({
        formControlName: 'avatar',
        accept: 'image/*',
        multiple: false,
        maxFileSize: 2 * 1024 * 1024,
        auto: true,
      });
      expect(f.config.attributes.multiple).toBe(false);
      expect(f.config.attributes.accept).toBe('image/*');
      expect(f.config.attributes.maxFileSize).toBe(2 * 1024 * 1024);
      expect(f.config.attributes.auto).toBe(true);
    });

    it('passes through custom labels for i18n', () => {
      const f = presets.dragUpload({
        formControlName: 'docs',
        chooseLabel: 'Sélectionner',
        uploadLabel: 'Téléverser',
        cancelLabel: 'Annuler',
        dragDropLabel: 'Glissez-déposez vos fichiers ici',
      });
      expect(f.config.attributes.chooseLabel).toBe('Sélectionner');
      expect(f.config.attributes.uploadLabel).toBe('Téléverser');
      expect(f.config.attributes.dragDropLabel).toBe('Glissez-déposez vos fichiers ici');
    });

    it('omits required by default; adds when requested', () => {
      expect(presets.dragUpload({ formControlName: 'd' }).validations?.rules?.required).toBeUndefined();
      expect(presets.dragUpload({ formControlName: 'd', required: true }).validations?.rules?.required).toBe(true);
    });
  });

  describe('treeSelect (1.13.0)', () => {
    const nodes = [
      { key: '1', label: 'Sales', children: [
        { key: '1-0', label: 'North America' },
        { key: '1-1', label: 'EMEA' },
      ]},
      { key: '2', label: 'Engineering' },
    ];

    it('defaults to single-mode select with no filter', () => {
      const f = presets.treeSelect({ formControlName: 'cat', nodes });
      expect(f.config.attributes.inputType).toBe('treeSelect');
      expect(f.config.attributes.treeSelectionMode).toBe('single');
      expect(f.config.attributes.filter).toBe(false);
      expect(f.config.attributes.propagateSelectionDown).toBe(true);
      expect(f.config.attributes.propagateSelectionUp).toBe(true);
      expect(f.config.attributes.nodes).toBe(nodes);
    });

    it('switches to checkbox + chip display + filter when asked', () => {
      const f = presets.treeSelect({
        formControlName: 'perms',
        nodes,
        mode: 'checkbox',
        display: 'chip',
        filter: true,
      });
      expect(f.config.attributes.treeSelectionMode).toBe('checkbox');
      expect(f.config.attributes.display).toBe('chip');
      expect(f.config.attributes.filter).toBe(true);
    });

    it('supports multiple mode + custom scrollHeight + showClear', () => {
      const f = presets.treeSelect({
        formControlName: 'tags',
        nodes,
        mode: 'multiple',
        scrollHeight: '450px',
        showClear: true,
      });
      expect(f.config.attributes.treeSelectionMode).toBe('multiple');
      expect(f.config.attributes.scrollHeight).toBe('450px');
      expect(f.config.attributes.showClear).toBe(true);
    });

    it('can disable propagation (independent parent/child selection)', () => {
      const f = presets.treeSelect({
        formControlName: 'x',
        nodes,
        mode: 'checkbox',
        propagateSelectionDown: false,
        propagateSelectionUp: false,
      });
      expect(f.config.attributes.propagateSelectionDown).toBe(false);
      expect(f.config.attributes.propagateSelectionUp).toBe(false);
    });

    it('emits select / unselect / clear / change / blur events by default', () => {
      const f = presets.treeSelect({ formControlName: 'c', nodes });
      expect(f.config.attributes.acceptedEvents).toEqual(['select', 'unselect', 'clear', 'change', 'blur']);
    });
  });

  describe('timeSlots (1.14.0)', () => {
    it('defaults to single-pick + primary/secondary styling', () => {
      const f = presets.timeSlots({
        formControlName: 'slot',
        slots: ['09:00', '09:30'],
      });
      expect(f.config.attributes.inputType).toBe('timeSlots');
      expect(f.config.attributes.multiple).toBe(false);
      expect(f.config.attributes.selectedSeverity).toBe('primary');
      expect(f.config.attributes.unselectedSeverity).toBe('secondary');
      expect((f.config.attributes.slots as unknown[]).length).toBe(2);
    });

    it('supports multi-pick + custom severities', () => {
      const f = presets.timeSlots({
        formControlName: 'sessions',
        slots: ['mon', 'tue'],
        multiple: true,
        selectedSeverity: 'success',
        unselectedSeverity: 'info',
      });
      expect(f.config.attributes.multiple).toBe(true);
      expect(f.config.attributes.selectedSeverity).toBe('success');
      expect(f.config.attributes.unselectedSeverity).toBe('info');
    });

    it('accepts rich Slot[] with disabled flag', () => {
      const f = presets.timeSlots({
        formControlName: 's',
        slots: [
          { value: '9am', label: 'Mon 9 AM' },
          { value: '10am', label: 'Mon 10 AM', disabled: true },
        ],
      });
      const slots = f.config.attributes.slots as { value: string; disabled?: boolean }[];
      expect(slots[1].disabled).toBe(true);
    });

    it('emits change + blur events by default', () => {
      const f = presets.timeSlots({ formControlName: 's', slots: [] });
      expect(f.config.attributes.acceptedEvents).toEqual(['change', 'blur']);
    });

    it('omits required by default; adds when requested', () => {
      expect(presets.timeSlots({ formControlName: 's', slots: [] }).validations?.rules?.required).toBeUndefined();
      expect(presets.timeSlots({ formControlName: 's', slots: [], required: true }).validations?.rules?.required).toBe(true);
    });
  });

  describe('markdown (1.15.0)', () => {
    it('defaults to split layout with 8 rows', () => {
      const f = presets.markdown({ formControlName: 'bio' });
      expect(f.config.attributes.inputType).toBe('markdown');
      expect(f.config.attributes.mdLayout).toBe('split');
      expect(f.config.attributes.rows).toBe(8);
    });

    it('honours editor-only / preview-only layouts', () => {
      expect(presets.markdown({ formControlName: 'x', layout: 'editor' }).config.attributes.mdLayout).toBe('editor');
      expect(presets.markdown({ formControlName: 'x', layout: 'preview' }).config.attributes.mdLayout).toBe('preview');
    });

    it('maps minLength / maxLength to validators for character counts', () => {
      const f = presets.markdown({
        formControlName: 'bio',
        minLength: 10,
        maxLength: 500,
      });
      expect(f.validations?.rules?.minLength).toBe(10);
      expect(f.validations?.rules?.maxLength).toBe(500);
    });

    it('omits required by default; adds when requested', () => {
      expect(presets.markdown({ formControlName: 'm' }).validations?.rules?.required).toBeUndefined();
      expect(presets.markdown({ formControlName: 'm', required: true }).validations?.rules?.required).toBe(true);
    });
  });

  describe('captcha (1.16.0)', () => {
    it('produces captcha renderer with sitekey + sensible defaults', () => {
      const f = presets.captcha({ sitekey: '1x00000000000000000000AA' });
      expect(f.config.attributes.inputType).toBe('captcha');
      expect(f.config.attributes.sitekey).toBe('1x00000000000000000000AA');
      expect(f.config.attributes.captchaTheme).toBe('auto');
      expect(f.config.attributes.captchaSize).toBe('normal');
      expect(f.formControlName).toBe('captchaToken');
      expect(f.validations?.rules?.required).toBe(true);
    });

    it('honours custom formControlName + theme + size + action', () => {
      const f = presets.captcha({
        sitekey: 'real-key',
        formControlName: 'cfToken',
        theme: 'dark',
        size: 'flexible',
        action: 'signup',
      });
      expect(f.formControlName).toBe('cfToken');
      expect(f.config.attributes.captchaTheme).toBe('dark');
      expect(f.config.attributes.captchaSize).toBe('flexible');
      expect(f.config.attributes.captchaAction).toBe('signup');
    });

    it('uses a human-friendly required message', () => {
      const f = presets.captcha({ sitekey: 'k' });
      expect(f.validations?.messages?.required).toBe('Please complete the captcha');
    });

    it('allows opting out of required (rare but valid for optional anti-bot)', () => {
      const f = presets.captcha({ sitekey: 'k', required: false });
      expect(f.validations?.rules?.required).toBe(false);
    });
  });

  describe('email', () => {
    it('produces a text input with email validation + envelope icon', () => {
      const f = presets.email({ formControlName: 'workEmail' });
      expect(f.config.attributes.inputType).toBe('text');
      expect(f.config.attributes.type).toBe('email');
      expect(f.config.attributes.fieldIcon).toBe('pi pi-envelope');
      expect(f.validations?.rules?.email).toBe(true);
      expect(f.validations?.rules?.required).toBe(true);
    });
  });

  describe('submit', () => {
    it('defaults to formControlName=submitBtn with click accepted', () => {
      const f = presets.submit();
      expect(f.formControlName).toBe('submitBtn');
      expect(f.config.attributes.buttonRole).toBe('submit');
      expect(f.config.attributes.acceptedEvents).toContain('click');
    });
  });
});
