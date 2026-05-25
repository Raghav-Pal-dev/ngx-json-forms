/**
 * Canvas-backed signature pad. Implements `ControlValueAccessor` so it
 * works inside reactive forms (and the JSON-driven engine) without
 * adapter glue.
 *
 * Value: a PNG data URL (`data:image/png;base64,...`) while there's a
 * signature; `null` when empty / cleared. That makes it trivially
 * persistable and previewable — `<img [src]="value">` just works.
 *
 * The component owns its own state (drawing strokes) and surfaces:
 *   - `clear()` to wipe the canvas (also fires `change` with `null`)
 *   - `penColor` / `penWidth` / `height` inputs for cosmetics
 *
 * Pointer events (not mouse events) so it works on touch + stylus +
 * mouse without three sets of listeners. `touch-action: none` on the
 * canvas prevents the browser scrolling while you sign.
 *
 * @since 1.10.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'ngx-signature-pad',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host {
        display: block;
        position: relative;
      }
      .pad-shell {
        border: 1px solid var(--p-inputtext-border-color, #d4d4d8);
        border-radius: var(--p-inputtext-border-radius, 6px);
        background: var(--p-inputtext-background, #fff);
        overflow: hidden;
      }
      canvas {
        display: block;
        width: 100%;
        height: 100%;
        touch-action: none;
        cursor: crosshair;
      }
      .pad-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 0.5rem 0.25rem 0;
      }
      .pad-actions[hidden] { display: none; }
    `,
  ],
  template: `
    <div class="pad-shell" [style.height.px]="height()">
      <canvas
        #canvas
        (pointerdown)="onPointerDown($event)"
        (pointermove)="onPointerMove($event)"
        (pointerup)="onPointerUp($event)"
        (pointercancel)="onPointerUp($event)"
        (pointerleave)="onPointerUp($event)"
      ></canvas>
    </div>
    @if (!hideClearButton()) {
      <div class="pad-actions">
        <button
          pButton
          type="button"
          severity="secondary"
          [text]="true"
          size="small"
          icon="pi pi-refresh"
          [label]="clearLabel()"
          (click)="clear()"
        ></button>
      </div>
    }
  `,
})
export class SignaturePadComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  /** Pen stroke color. Defaults to black; pass a CSS color string. */
  readonly penColor = input<string>('#111827');
  /** Pen line width in CSS px. Defaults to 2. */
  readonly penWidth = input<number>(2);
  /** Canvas height in CSS px. Width is responsive to the container. */
  readonly height = input<number>(180);
  /** Hide the built-in Clear button (e.g. if you wire your own). */
  readonly hideClearButton = input<boolean>(false);
  /** Label for the Clear button. */
  readonly clearLabel = input<string>('Clear');

  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly host = inject(ElementRef);
  private ctx: CanvasRenderingContext2D | null = null;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;
  private isEmpty = true;
  private dpr = 1;
  /** Resize observer so the canvas backing-store stays sharp + correctly sized. */
  private ro?: ResizeObserver;

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterViewInit(): void {
    this.dpr = window.devicePixelRatio || 1;
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.resizeCanvas();
    // Re-fit on container resize. Cheaper than relying on the parent
    // to remember to re-render us; if it's hidden initially (e.g.
    // inside a wizard step), the resize observer fires on reveal.
    this.ro = new ResizeObserver(() => this.resizeCanvas());
    this.ro.observe(this.canvasRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  // ── ControlValueAccessor ──

  writeValue(value: string | null): void {
    if (!this.ctx) {
      // View not yet ready — defer until afterViewInit completes by
      // scheduling a microtask. (CVA can be called pre-init.)
      queueMicrotask(() => this.writeValue(value));
      return;
    }
    this.clearCanvas();
    if (!value) return;
    const img = new Image();
    img.onload = () => {
      const cnv = this.canvasRef.nativeElement;
      this.ctx!.drawImage(img, 0, 0, cnv.width / this.dpr, cnv.height / this.dpr);
      this.isEmpty = false;
    };
    img.src = value;
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    const cnv = this.canvasRef?.nativeElement;
    if (!cnv) return;
    cnv.style.pointerEvents = isDisabled ? 'none' : 'auto';
    cnv.style.opacity = isDisabled ? '0.6' : '1';
  }

  // ── Public API ──

  /** Wipe the canvas and emit `null` to the form control. */
  clear(): void {
    this.clearCanvas();
    this.isEmpty = true;
    this.onChange(null);
    this.onTouched();
  }

  // ── Pointer handlers ──

  onPointerDown(e: PointerEvent): void {
    if (!this.ctx) return;
    this.drawing = true;
    [this.lastX, this.lastY] = this.eventCoords(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    // capture so we keep getting moves even if pointer leaves the canvas
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.drawing || !this.ctx) return;
    const [x, y] = this.eventCoords(e);
    this.ctx.strokeStyle = this.penColor();
    this.ctx.lineWidth = this.penWidth();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
    this.isEmpty = false;
  }

  onPointerUp(_e: PointerEvent): void {
    if (!this.drawing) return;
    this.drawing = false;
    this.ctx?.closePath();
    // Emit only on stroke end (not on every move) — avoids burning CPU
    // serialising the canvas 60 times/sec while the user is signing.
    if (!this.isEmpty) {
      this.onChange(this.canvasRef.nativeElement.toDataURL('image/png'));
      this.onTouched();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.resizeCanvas();
  }

  // ── Internals ──

  private eventCoords(e: PointerEvent): [number, number] {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  /**
   * Match the canvas backing-store to the CSS dimensions × DPR so
   * strokes render at native pixel sharpness. Preserves the current
   * signature across resizes (saves → resizes → restores).
   */
  private resizeCanvas(): void {
    const cnv = this.canvasRef.nativeElement;
    const rect = cnv.getBoundingClientRect();
    if (rect.width === 0) return;
    const saved = this.isEmpty ? null : cnv.toDataURL('image/png');
    cnv.width = Math.round(rect.width * this.dpr);
    cnv.height = Math.round(rect.height * this.dpr);
    cnv.style.width = `${rect.width}px`;
    cnv.style.height = `${rect.height}px`;
    if (this.ctx) {
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
    if (saved) {
      const img = new Image();
      img.onload = () => this.ctx?.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = saved;
    }
  }

  private clearCanvas(): void {
    const cnv = this.canvasRef.nativeElement;
    this.ctx?.clearRect(0, 0, cnv.width / this.dpr, cnv.height / this.dpr);
  }
}
