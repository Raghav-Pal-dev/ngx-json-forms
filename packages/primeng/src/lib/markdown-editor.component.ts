/**
 * Markdown editor + live preview. Textarea on one side, rendered
 * HTML on the other. Three layout modes (`'split'`, `'editor'`,
 * `'preview'`) so consumers can build a markdown-first or
 * preview-first UX.
 *
 * Dependency strategy: `marked` is declared as an **optional**
 * peer dep of `@ngx-json-forms/primeng`. We dynamic-import it on
 * first preview render so the rest of the library has zero load
 * cost for consumers who never touch markdown. If the dep is
 * missing, the preview pane shows a clear install hint instead of
 * blowing up.
 *
 * `marked` v16+ is async by default, but the sync `parse()` mode
 * (`async: false`) is still supported and is the right call here —
 * we want preview re-render synchronously as the user types.
 *
 * Output sanitisation: we DO NOT sanitise the HTML. `marked` itself
 * escapes raw HTML in input by default (unless the user opts in),
 * and Angular's `[innerHTML]` binding applies its own sanitiser.
 * That covers the common XSS surface; if you need bulletproof
 * sanitisation (rich-text + custom HTML), bring your own
 * `DOMPurify` step at the consumer level.
 *
 * @since 1.15.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

type MarkedLib = { parse: (md: string, opts?: { async?: false }) => string };

@Component({
  selector: 'ngx-markdown-editor',
  imports: [TextareaModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: block; width: 100%; }
      .ngx-md-shell {
        display: grid;
        gap: 0.75rem;
        width: 100%;
        min-width: 0;  // F11: prevent grid blowout that left a ghost column
      }
      .ngx-md-shell.layout-split {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
      .ngx-md-shell.layout-editor,
      .ngx-md-shell.layout-preview {
        grid-template-columns: minmax(0, 1fr);
      }
      .ngx-md-shell textarea { width: 100%; min-width: 0; }
      .ngx-md-preview {
        padding: 0.75rem;
        border: 1px solid var(--p-inputtext-border-color, #d4d4d8);
        border-radius: var(--p-inputtext-border-radius, 6px);
        background: var(--p-inputtext-background, #fff);
        min-height: 8rem;
        max-height: 24rem;
        overflow: auto;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .ngx-md-preview > :first-child { margin-top: 0; }
      .ngx-md-preview > :last-child { margin-bottom: 0; }
      .ngx-md-preview code {
        background: rgba(0, 0, 0, 0.05);
        padding: 0.1rem 0.3rem;
        border-radius: 3px;
        font-size: 0.9em;
      }
      .ngx-md-preview pre {
        background: rgba(0, 0, 0, 0.05);
        padding: 0.5rem;
        border-radius: 6px;
        overflow: auto;
      }
      .ngx-md-preview pre code { background: transparent; padding: 0; }
      .ngx-md-warn {
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
      }
    `,
  ],
  template: `
    <div class="ngx-md-shell" [class]="'layout-' + layout()">
      @if (layout() !== 'preview') {
        <textarea
          pTextarea
          [rows]="rows()"
          [placeholder]="placeholder()"
          [ngModel]="raw()"
          (ngModelChange)="onInput($event)"
          [disabled]="disabledSig()"
        ></textarea>
      }
      @if (layout() !== 'editor') {
        <div class="ngx-md-preview">
          @if (markedMissing()) {
            <p class="ngx-md-warn">
              Install <code>marked</code> to enable markdown preview:<br />
              <code>npm install marked</code>
            </p>
          } @else {
            <div [innerHTML]="html()"></div>
          }
        </div>
      }
    </div>
  `,
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  /** Layout. `'split'` shows both editor + preview; `'editor'` hides preview; `'preview'` hides editor. */
  readonly layout = input<'split' | 'editor' | 'preview'>('split');
  /** Textarea row count. Defaults to 8. */
  readonly rows = input<number>(8);
  /** Placeholder text inside the editor textarea. */
  readonly placeholder = input<string>('Write markdown…');

  /** True when the `marked` peer dep failed to load. */
  protected readonly markedMissing = signal(false);
  /** Loaded marked module (set after dynamic import resolves). */
  private readonly marked = signal<MarkedLib | null>(null);

  protected readonly disabledSig = signal(false);
  protected readonly raw = signal<string>('');

  /** Rendered HTML — re-computes on any change to raw OR marked-ready. */
  protected readonly html = computed<string>(() => {
    const m = this.marked();
    const src = this.raw();
    if (!m || !src) return '';
    try {
      return m.parse(src, { async: false }) as string;
    } catch {
      return '';
    }
  });

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    // Dynamic-import `marked` on construction. If absent, surface a
    // hint in the preview pane instead of crashing the form.
    // (Dynamic import survives ng-packagr's partial compilation and
    // is preserved as a runtime ESM dep load.)
    void this.loadMarked();

    // Side-effect-free: nothing else.
    effect(() => void this.html());
  }

  private async loadMarked(): Promise<void> {
    try {
      const m = (await import('marked')) as MarkedLib;
      this.marked.set(m);
    } catch {
      this.markedMissing.set(true);
    }
  }

  // ── ControlValueAccessor ──

  writeValue(value: string | null): void {
    this.raw.set(value ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabledSig.set(isDisabled);
  }

  protected onInput(v: string): void {
    this.raw.set(v ?? '');
    this.onChange(v ?? '');
    this.onTouched();
  }
}
