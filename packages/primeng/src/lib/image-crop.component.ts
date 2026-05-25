/**
 * Upload-then-crop image input. Pick a file (or drop), interactively
 * crop, and the form gets a PNG data URL of the cropped region.
 * Typical use: profile avatars, post cover images, KYC photos.
 *
 * Implementation strategy:
 *  - `cropperjs@^1.6` is an **optional** peer dep of
 *    `@ngx-json-forms/primeng`. The component dynamic-imports it on
 *    first file pick so consumers who never use image-crop pay
 *    zero load cost. Without it, a clear "Install cropperjs" hint
 *    appears in place of the cropper.
 *  - Cropper v1's API is small: `new Cropper(img, opts)` →
 *    `cropper.getCroppedCanvas().toDataURL('image/png')` on demand.
 *  - We also load the Cropper CSS lazily via `<link rel="stylesheet">`
 *    since ng-packagr can't bundle a CSS file from an *optional*
 *    peer's path at build time. Idempotent across instances.
 *
 * Implements `ControlValueAccessor`. Value is a `data:image/png;base64,…`
 * string while cropped, `null` when cleared.
 *
 * @since 1.17.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

type CropperCtor = new (
  el: HTMLImageElement,
  opts?: Record<string, unknown>
) => {
  destroy(): void;
  getCroppedCanvas(opts?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    imageSmoothingEnabled?: boolean;
    imageSmoothingQuality?: 'low' | 'medium' | 'high';
    fillColor?: string;
  }): HTMLCanvasElement;
  setAspectRatio(ratio: number): void;
  reset(): void;
};

const CROPPER_CSS_HREF = 'https://cdn.jsdelivr.net/npm/cropperjs@1/dist/cropper.min.css';
const CROPPER_CSS_ID = 'ngx-cropper-css';
let cssLoaded = false;

function loadCropperCssOnce(): void {
  if (cssLoaded || typeof document === 'undefined') return;
  if (document.getElementById(CROPPER_CSS_ID)) {
    cssLoaded = true;
    return;
  }
  const link = document.createElement('link');
  link.id = CROPPER_CSS_ID;
  link.rel = 'stylesheet';
  link.href = CROPPER_CSS_HREF;
  document.head.appendChild(link);
  cssLoaded = true;
}

@Component({
  selector: 'ngx-image-crop',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageCropComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: block; }
      .ngx-crop-shell {
        border: 1px solid var(--p-inputtext-border-color, #d4d4d8);
        border-radius: var(--p-inputtext-border-radius, 6px);
        background: var(--p-inputtext-background, #fff);
        padding: 0.75rem;
      }
      .ngx-crop-pickrow {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }
      .ngx-crop-pickrow input[type='file'] { flex: 1; }
      .ngx-crop-stage {
        max-width: 100%;
      }
      .ngx-crop-stage img {
        max-width: 100%;
        display: block;
      }
      .ngx-crop-warn {
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
      }
      .ngx-crop-preview {
        margin-top: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .ngx-crop-preview img {
        max-width: 96px;
        max-height: 96px;
        border-radius: 4px;
        border: 1px solid var(--p-inputtext-border-color, #d4d4d8);
        object-fit: cover;
      }
    `,
  ],
  template: `
    <div class="ngx-crop-shell">
      <div class="ngx-crop-pickrow">
        <input
          type="file"
          [accept]="accept()"
          [disabled]="disabledSig()"
          (change)="onFile($event)"
        />
        @if (sourceUrl()) {
          <p-button
            type="button"
            size="small"
            severity="secondary"
            [text]="true"
            icon="pi pi-check"
            label="Apply"
            (onClick)="apply()"
          ></p-button>
          <p-button
            type="button"
            size="small"
            severity="secondary"
            [text]="true"
            icon="pi pi-times"
            label="Clear"
            (onClick)="clear()"
          ></p-button>
        }
      </div>

      @if (cropperMissing()) {
        <p class="ngx-crop-warn">
          Install <code>cropperjs</code> to enable image cropping:<br />
          <code>npm install cropperjs@^1.6</code>
        </p>
      } @else if (sourceUrl()) {
        <div class="ngx-crop-stage">
          <img #stageImg [src]="sourceUrl()" alt="crop source" />
        </div>
      }

      @if (preview()) {
        <div class="ngx-crop-preview">
          <img [src]="preview()" alt="cropped preview" />
          <span class="ngx-crop-warn">
            Saved to form. ({{ preview()!.length }} chars)
          </span>
        </div>
      }
    </div>
  `,
})
export class ImageCropComponent implements ControlValueAccessor, OnDestroy {
  /** Aspect ratio. e.g. `1` for square avatar, `16/9`, `NaN` for free. Defaults `1`. */
  readonly aspectRatio = input<number>(1);
  /** File picker accept attribute. Defaults to `'image/*'`. */
  readonly accept = input<string>('image/*');
  /** Output PNG max width in px (capped to natural). Defaults 1024. */
  readonly maxOutputWidth = input<number>(1024);
  /** Output PNG max height. */
  readonly maxOutputHeight = input<number>(1024);

  @ViewChild('stageImg', { static: false })
  private stageImg?: ElementRef<HTMLImageElement>;

  protected readonly cropperMissing = signal(false);
  protected readonly sourceUrl = signal<string | null>(null);
  protected readonly preview = signal<string | null>(null);
  protected readonly disabledSig = signal(false);

  private CropperCtor: CropperCtor | null = null;
  private instance: InstanceType<CropperCtor> | null = null;

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  // ── ControlValueAccessor ──

  writeValue(value: string | null): void {
    this.preview.set(value);
    if (!value) {
      this.sourceUrl.set(null);
      this.destroyInstance();
    }
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabledSig.set(isDisabled);
  }

  ngOnDestroy(): void {
    this.destroyInstance();
  }

  // ── File pick ──

  protected async onFile(evt: Event): Promise<void> {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Load the cropper module + CSS on first pick.
    if (!this.CropperCtor) {
      try {
        const mod = (await import('cropperjs')) as unknown as { default: CropperCtor };
        this.CropperCtor = mod.default;
      } catch {
        this.cropperMissing.set(true);
        return;
      }
      loadCropperCssOnce();
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.sourceUrl.set(reader.result as string);
      // Defer to next tick so the <img> is in the DOM before we wrap it.
      queueMicrotask(() => this.initCropper());
    };
    reader.readAsDataURL(file);
  }

  private initCropper(): void {
    if (!this.CropperCtor || !this.stageImg) return;
    this.destroyInstance();
    this.instance = new this.CropperCtor(this.stageImg.nativeElement, {
      aspectRatio: this.aspectRatio(),
      viewMode: 1,
      autoCropArea: 0.9,
      movable: true,
      zoomable: true,
      rotatable: false,
      scalable: false,
    });
  }

  protected apply(): void {
    if (!this.instance) return;
    const canvas = this.instance.getCroppedCanvas({
      maxWidth: this.maxOutputWidth(),
      maxHeight: this.maxOutputHeight(),
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillColor: '#fff',
    });
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    this.preview.set(dataUrl);
    this.onChange(dataUrl);
    this.onTouched();
  }

  protected clear(): void {
    this.preview.set(null);
    this.sourceUrl.set(null);
    this.destroyInstance();
    this.onChange(null);
    this.onTouched();
    // Force reset of the file input so picking the same file again
    // triggers a fresh change event.
    const fileInput = (event?.target as HTMLElement | undefined)
      ?.closest('.ngx-crop-pickrow')
      ?.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }

  private destroyInstance(): void {
    if (this.instance) {
      try { this.instance.destroy(); } catch { /* already destroyed */ }
      this.instance = null;
    }
  }
}
