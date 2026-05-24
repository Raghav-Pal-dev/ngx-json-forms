import { Injectable } from '@angular/core';
import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';

/**
 * Registry of synchronous and asynchronous custom validators that JSON
 * field definitions reference by string token.
 *
 * Field JSON:
 *   { validations: { asyncValidators: ['uniqueUsername'] } }
 *   { validations: { rules: { custom: ['noProfanity'] } } }
 *
 * The application registers them once at bootstrap:
 *   registry.registerAsync('uniqueUsername', usernameTakenValidator);
 *   registry.registerSync('noProfanity', noProfanityValidator);
 */
@Injectable({ providedIn: 'root' })
export class AsyncValidatorRegistry {
  private readonly sync = new Map<string, ValidatorFn>();
  private readonly async = new Map<string, AsyncValidatorFn>();

  registerSync(token: string, validator: ValidatorFn): void {
    this.sync.set(token, validator);
  }

  registerAsync(token: string, validator: AsyncValidatorFn): void {
    this.async.set(token, validator);
  }

  getSync(token: string): ValidatorFn | undefined {
    return this.sync.get(token);
  }

  getAsync(token: string): AsyncValidatorFn | undefined {
    return this.async.get(token);
  }

  clear(): void {
    this.sync.clear();
    this.async.clear();
  }
}
