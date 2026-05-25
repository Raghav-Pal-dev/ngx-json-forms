/**
 * Code editor with syntax highlighting (CodeMirror 6). Use for
 * snippet fields in dev-tool-adjacent products: JSON config, regex
 * playgrounds, query builders, prompt templates.
 *
 * Dependency strategy: CodeMirror 6 is a constellation of packages
 * (state, view, language, commands, plus a per-language module per
 * supported syntax). All are declared as OPTIONAL peer deps of
 * `@ngx-json-forms/primeng` — we dynamic-import them on first init,
 * picking only the language package the consumer asked for. The
 * rest of the library has zero load cost for consumers who never
 * touch this field.
 *
 * Without the deps installed the field falls back to a plain
 * `<textarea>` with an install hint — the form value still binds.
 *
 * Supported `language` values out of the box:
 *   `'javascript' | 'json' | 'html' | 'css' | 'markdown' | 'text'`
 *
 * Consumers wanting a language we don't list (Python, SQL, Rust, …)
 * register their own renderer via FieldRegistry — we don't want to
 * carry the surface area of every CM6 lang package.
 *
 * @since 1.19.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

type SupportedLanguage = 'javascript' | 'json' | 'html' | 'css' | 'markdown' | 'text';

interface CmView {
  destroy(): void;
  state: { doc: { toString(): string } };
  dispatch(tx: { changes: { from: number; to: number; insert: string } }): void;
}

@Component({
  selector: 'ngx-code-editor',
  imports: [TextareaModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CodeEditorComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: block; }
      .ngx-code-shell {
        border: 1px solid var(--p-inputtext-border-color, #d4d4d8);
        border-radius: var(--p-inputtext-border-radius, 6px);
        background: var(--p-inputtext-background, #fff);
        overflow: hidden;
      }
      .ngx-code-shell .cm-editor {
        outline: none;
      }
      .ngx-code-shell .cm-scroller {
        font-family:
          'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
          'Courier New', monospace;
        font-size: 0.9rem;
      }
      .ngx-code-warn {
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
        padding: 0.5rem;
      }
      .ngx-code-fallback {
        width: 100%;
        font-family:
          'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas,
          'Courier New', monospace;
      }
    `,
  ],
  template: `
    @if (libMissing()) {
      <textarea
        pTextarea
        class="ngx-code-fallback"
        [rows]="rows()"
        [ngModel]="raw()"
        (ngModelChange)="onFallbackInput($event)"
        [disabled]="disabledSig()"
      ></textarea>
      <p class="ngx-code-warn">
        Install CodeMirror 6 for syntax highlighting:<br />
        <code>npm install codemirror @codemirror/state @codemirror/view
          @codemirror/language @codemirror/commands
          @codemirror/lang-{{ language() }}</code>
      </p>
    } @else {
      <div #host class="ngx-code-shell" [style.minHeight]="height()"></div>
    }
  `,
})
export class CodeEditorComponent
  implements ControlValueAccessor, AfterViewInit, OnDestroy
{
  /** Syntax-highlighting language. Defaults to `'text'`. */
  readonly language = input<SupportedLanguage>('text');
  /** Container min-height (CSS length). Defaults to `'12rem'`. */
  readonly height = input<string>('12rem');
  /** Read-only mode. Defaults to false. */
  readonly readonly = input<boolean>(false);
  /** Textarea row count for the fallback when CM6 isn't installed. */
  readonly rows = input<number>(10);

  @ViewChild('host', { static: false })
  private hostRef?: ElementRef<HTMLDivElement>;

  protected readonly libMissing = signal(false);
  protected readonly disabledSig = signal(false);
  protected readonly raw = signal<string>('');

  private view: CmView | null = null;
  private pendingValue: string | null = null;

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  async ngAfterViewInit(): Promise<void> {
    try {
      await this.initView();
      if (this.pendingValue !== null) {
        this.replaceDoc(this.pendingValue);
        this.pendingValue = null;
      }
    } catch {
      this.libMissing.set(true);
    }
  }

  ngOnDestroy(): void {
    this.view?.destroy();
    this.view = null;
  }

  // ── ControlValueAccessor ──

  writeValue(value: string | null): void {
    const next = value ?? '';
    if (!this.view) {
      // Defer until afterViewInit completes.
      this.pendingValue = next;
      this.raw.set(next);
      return;
    }
    this.replaceDoc(next);
    this.raw.set(next);
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

  // ── Fallback (no CM6) ──

  protected onFallbackInput(v: string): void {
    this.raw.set(v ?? '');
    this.onChange(v ?? '');
    this.onTouched();
  }

  // ── CM6 boot ──

  private async initView(): Promise<void> {
    if (!this.hostRef) return;

    // Dynamic-import every CM6 module we need. Each `await import` is
    // its own code-split point so the consumer's app gets a single
    // chunk per language they actually use.
    const [
      { EditorState },
      { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection },
      { defaultKeymap, history, historyKeymap },
      { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentOnInput },
    ] = await Promise.all([
      import('@codemirror/state'),
      import('@codemirror/view'),
      import('@codemirror/commands'),
      import('@codemirror/language'),
    ]);

    const lang = this.language();
    let langExtension: unknown[] = [];
    try {
      if (lang === 'javascript') {
        const m = await import('@codemirror/lang-javascript');
        langExtension = [m.javascript()];
      } else if (lang === 'json') {
        const m = await import('@codemirror/lang-json');
        langExtension = [m.json()];
      } else if (lang === 'html') {
        const m = await import('@codemirror/lang-html');
        langExtension = [m.html()];
      } else if (lang === 'css') {
        const m = await import('@codemirror/lang-css');
        langExtension = [m.css()];
      } else if (lang === 'markdown') {
        const m = await import('@codemirror/lang-markdown');
        langExtension = [m.markdown()];
      } else {
        langExtension = []; // 'text' — no syntax extension
      }
    } catch {
      // Language pack missing — fine, fall through to no-highlight.
      langExtension = [];
    }

    const updateListener = EditorView.updateListener.of((u) => {
      if (u.docChanged) {
        const v = u.state.doc.toString();
        this.raw.set(v);
        this.onChange(v);
      }
    });

    const startDoc = this.pendingValue ?? '';

    const state = EditorState.create({
      doc: startDoc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        bracketMatching(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorView.editable.of(!this.readonly()),
        EditorState.readOnly.of(this.readonly()),
        updateListener,
        ...(langExtension as []),
      ],
    });

    this.view = new EditorView({
      state,
      parent: this.hostRef.nativeElement,
    }) as unknown as CmView;
  }

  private replaceDoc(value: string): void {
    if (!this.view) return;
    const current = this.view.state.doc.toString();
    if (current === value) return;
    this.view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  }
}
