import { FormField } from './types';

/**
 * A `FormField` whose `formControlName` is type-narrowed to a key of `T`.
 *
 * Use it directly when you want a single typed field, e.g.:
 *
 *   const emailField: TypedFormField<{ email: string }> = { ... };
 */
export type TypedFormField<T> = Omit<FormField, 'formControlName'> & {
  formControlName?: Extract<keyof T, string>;
};

/**
 * Typed factory for a form schema. The fields you pass in are type-checked
 * against the shape `T`, so misspelling a `formControlName` becomes a
 * compile error (instead of a silent runtime mismatch).
 *
 * Returns the same array reference — no runtime cost.
 *
 * @example
 * interface ProfileDto {
 *   firstName: string;
 *   lastName:  string;
 *   email:     string;
 * }
 *
 * const fields = defineForm<ProfileDto>([
 *   { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
 *   { formControlName: 'lastName',  config: { attributes: { inputType: 'text' } } },
 *   { formControlName: 'email',     config: { attributes: { inputType: 'text' } } },
 *   // { formControlName: 'emial', ... }   // ❌ compile error: 'emial' is not a key of ProfileDto
 * ]);
 *
 * Layout / non-form-control fields (e.g. `divider`, `staticText`, `button`)
 * stay untyped — they don't have to match a key of `T`.
 */
export function defineForm<T>(fields: TypedFormField<T>[]): FormField[] {
  return fields as FormField[];
}
