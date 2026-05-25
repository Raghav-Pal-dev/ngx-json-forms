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
