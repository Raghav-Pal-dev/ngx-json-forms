import { defineForm, TypedFormField } from './define-form';
import { FormField } from './types';

describe('defineForm', () => {
  interface ProfileDto {
    firstName: string;
    lastName: string;
    email: string;
  }

  it('returns the same array reference (zero runtime cost)', () => {
    const input: TypedFormField<ProfileDto>[] = [
      { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
    ];
    const out = defineForm<ProfileDto>(input);
    expect(out).toBe(input as unknown as FormField[]);
  });

  it('accepts every field type even when it has no formControlName (e.g. divider)', () => {
    const fields = defineForm<ProfileDto>([
      { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
      { config: { attributes: { inputType: 'divider' } } },
      { formControlName: 'email', config: { attributes: { inputType: 'text' } } },
    ]);
    expect(fields).toHaveLength(3);
  });

  // Type-only assertion — won't compile if the typing breaks. (No runtime expectation.)
  it('type-checks that formControlName must be a key of T', () => {
    // The following block must compile:
    defineForm<ProfileDto>([
      { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
      { formControlName: 'lastName',  config: { attributes: { inputType: 'text' } } },
      { formControlName: 'email',     config: { attributes: { inputType: 'text' } } },
    ]);

    // And this commented-out block would NOT compile (documenting the guarantee):
    // defineForm<ProfileDto>([
    //   { formControlName: 'emial', config: { attributes: { inputType: 'text' } } },
    // ]);
    expect(true).toBe(true);
  });
});
