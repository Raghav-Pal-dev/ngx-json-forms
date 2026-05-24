import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FORM_ENGINE_STORAGE, StorageAdapter } from './types';

const DEFAULT_NAMESPACE = 'ngxJsonForms:';

class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  setItem(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* quota or SSR — silently ignore */
    }
  }
  removeItem(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* noop */
    }
  }
}

/**
 * Saves form values to a storage adapter (localStorage by default) and
 * restores them on demand. Use `bind(group, key)` to enable automatic
 * persistence on every value change.
 */
@Injectable({ providedIn: 'root' })
export class FormPersistenceService {
  private readonly storage: StorageAdapter =
    inject(FORM_ENGINE_STORAGE, { optional: true }) ?? new LocalStorageAdapter();
  private readonly subs = new Map<string, () => void>();

  /** Save the FormGroup raw value snapshot keyed by `key`. */
  save(key: string, value: Record<string, unknown>): void {
    try {
      this.storage.setItem(DEFAULT_NAMESPACE + key, JSON.stringify(value));
    } catch {
      /* ignore non-serialisable values (Files, etc.) */
    }
  }

  /** Load a previously persisted snapshot, or null. */
  load<T = Record<string, unknown>>(key: string): T | null {
    const raw = this.storage.getItem(DEFAULT_NAMESPACE + key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  clear(key: string): void {
    this.storage.removeItem(DEFAULT_NAMESPACE + key);
  }

  /**
   * Bind a FormGroup to a persistence key. Calling again with the same
   * key replaces the previous subscription. Returns an unbind function.
   */
  bind(formGroup: FormGroup, key: string): () => void {
    this.unbind(key);

    const restored = this.load(key);
    if (restored && typeof restored === 'object') {
      formGroup.patchValue(restored, { emitEvent: false });
    }

    const sub = formGroup.valueChanges.subscribe(() => {
      this.save(key, formGroup.getRawValue());
    });
    const unbind = () => sub.unsubscribe();
    this.subs.set(key, unbind);
    return unbind;
  }

  unbind(key: string): void {
    const off = this.subs.get(key);
    if (off) {
      off();
      this.subs.delete(key);
    }
  }
}
