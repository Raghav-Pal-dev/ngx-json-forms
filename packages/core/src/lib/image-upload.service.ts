import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormField } from './types';
import { FormEngineService } from './form-engine.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  readonly imagePreviews = signal<Record<string, string[]>>({});

  private loadingMap = new Map<string, boolean>();
  readonly previewImage = signal<string | null>(null);

  /** Sync previews from current form values for all fileUpload fields */
  syncPreviews(fields: FormField[], formGroup: FormGroup): void {
    const next: Record<string, string[]> = {};

    for (const field of fields) {
      if (field.config.attributes.inputType !== 'fileUpload') continue;
      if (!field.formControlName) continue;

      const control = formGroup.get(field.formControlName);
      if (!control) continue;

      const normalized = this.normalize(control.value);
      next[field.formControlName] = normalized;

      normalized.forEach((img) => {
        if (!this.loadingMap.has(img)) this.loadingMap.set(img, true);
      });
    }

    this.imagePreviews.set(next);
  }

  /** Handle file upload event: convert to base64, append or replace */
  async handleUpload(
    field: FormField,
    event: { files: File[] },
    formGroup: FormGroup,
    formService: FormEngineService,
    onComplete: () => void
  ): Promise<void> {
    const newFiles: File[] = event?.files ?? [];
    if (!newFiles.length) return;

    const control = formGroup.get(field.formControlName!);
    if (!control) return;

    const existing = this.normalize(control.value);

    const newImages = await Promise.all(
      newFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );

    const finalValue = field.config.attributes.multiple
      ? [...existing, ...newImages]
      : newImages[0];

    control.patchValue(finalValue);
    control.markAsDirty();
    control.updateValueAndValidity();

    formService.bumpPatch();
    this.syncPreviews(formService.fields(), formGroup);
    onComplete();
  }

  removeImage(
    field: FormField,
    image: string,
    formGroup: FormGroup,
    formService: FormEngineService,
    onComplete: () => void
  ): void {
    const control = formGroup.get(field.formControlName!);
    if (!control) return;

    const updated = this.normalize(control.value).filter((i) => i !== image);
    control.patchValue(field.config.attributes.multiple ? updated : updated[0] ?? null);
    control.markAsDirty();
    control.updateValueAndValidity();

    formService.bumpPatch();
    this.syncPreviews(formService.fields(), formGroup);
    onComplete();
  }

  openPreview(image: string): void {
    this.previewImage.set(image);
  }

  isBase64(src: string): boolean {
    return src.startsWith('data:image');
  }

  isLoading(image: string): boolean {
    if (this.isBase64(image)) {
      this.loadingMap.set(image, false);
      return false;
    }
    return this.loadingMap.get(image) === true;
  }

  onLoad(image: string): void {
    setTimeout(() => this.loadingMap.set(image, false), 250);
  }

  private normalize(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((v) => typeof v === 'string');
    if (typeof value === 'string') return [value];
    return [];
  }
}
