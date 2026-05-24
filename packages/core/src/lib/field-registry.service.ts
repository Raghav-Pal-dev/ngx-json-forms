import { Injectable, Type } from '@angular/core';
import { ComputationFn, OptionsLoaderFn } from './types';

/**
 * Application-wide registry for plug-in renderers, async option loaders
 * and computation functions referenced from a JSON form definition.
 *
 * The renderer registry lets adapters (or app code) introduce brand-new
 * `inputType` values without forking the package: register a component,
 * reference its key from JSON. The renderer is responsible for accepting
 * `field` and `formGroup` inputs.
 */
@Injectable({ providedIn: 'root' })
export class FieldRegistry {
  private readonly renderers = new Map<string, Type<unknown>>();
  private readonly loaders = new Map<string, OptionsLoaderFn>();
  private readonly computations = new Map<string, ComputationFn>();

  // ── Renderers ────────────────────────────────────────────────────────────

  registerRenderer(inputType: string, component: Type<unknown>): void {
    this.renderers.set(inputType, component);
  }

  getRenderer(inputType: string): Type<unknown> | undefined {
    return this.renderers.get(inputType);
  }

  hasRenderer(inputType: string): boolean {
    return this.renderers.has(inputType);
  }

  // ── Async option loaders ─────────────────────────────────────────────────

  registerOptionsLoader(token: string, fn: OptionsLoaderFn): void {
    this.loaders.set(token, fn);
  }

  getOptionsLoader(token: string): OptionsLoaderFn | undefined {
    return this.loaders.get(token);
  }

  // ── Computation functions ────────────────────────────────────────────────

  registerComputation(token: string, fn: ComputationFn): void {
    this.computations.set(token, fn);
  }

  getComputation(token: string): ComputationFn | undefined {
    return this.computations.get(token);
  }

  // ── Test helpers ─────────────────────────────────────────────────────────

  clear(): void {
    this.renderers.clear();
    this.loaders.clear();
    this.computations.clear();
  }
}
