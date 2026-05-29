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
/**
 * The parameter type accepts both:
 *   - `TypedFormField<T>` — fields you wrote inline (gets the keyof T narrowing)
 *   - `FormField` — values from `presets.*()` factories which intentionally
 *     return the wide `FormField` shape (the preset doesn't know about T)
 *
 * Mixing the two is by far the most common pattern (preset + inline override),
 * so accepting both keeps the call-site ergonomic without losing type safety
 * for the inline values.
 *
 * Discovered during the tester pass: rejecting `FormField` made every
 * `defineForm<T>([presets.text({...}), ...])` invocation a compile error.
 * (Reported as Tier-1 BUG #1.)
 */
export function defineForm<T>(
  fields: ReadonlyArray<TypedFormField<T> | FormField>
): FormField[] {
  return fields as unknown as FormField[];
}
