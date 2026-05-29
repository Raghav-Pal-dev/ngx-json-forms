import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent } from '@ngx-json-forms/core';
import { FIELD_CATALOG, findField } from '../catalog';

const SB_BASE = 'https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz';

/**
 * Per-field showcase: live preview (real <ngx-json-form>), the copy-paste
 * config, the live form value, an Open-in-StackBlitz deep link, install + peer
 * notes, and prev/next navigation.
 */
@Component({
  selector: 'demo-field-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgxJsonFormComponent],
  template: `
    @if (entry(); as f) {
      <div class="wrap">
        <nav class="crumbs">
          <a routerLink="/fields"><i class="pi pi-arrow-left"></i> All fields</a>
          <span class="sep">/</span>
          <span class="cur">{{ f.category }}</span>
        </nav>

        <header class="head">
          <span class="ic"><i [class]="'pi ' + f.icon"></i></span>
          <div>
            <h1>{{ f.title }} @if (f.since) { <span class="since">since {{ f.since }}</span> }</h1>
            <p>{{ f.blurb }}</p>
          </div>
          <a class="sb" [href]="sbUrl()" target="_blank" rel="noopener">
            <i class="pi pi-external-link"></i> Open in StackBlitz
          </a>
        </header>

        @if (f.peer) {
          <div class="note">
            <i class="pi pi-info-circle"></i>
            Needs the optional peer dependency <code>{{ f.peer }}</code> —
            <code>npm i {{ f.peer }}</code>. Without it the field degrades gracefully.
          </div>
        }

        <div class="cols">
          <!-- Live preview -->
          <section class="panel">
            <div class="panel-head"><span><i class="pi pi-eye"></i> Live preview</span></div>
            <div class="preview">
              <ngx-json-form [fieldsInput]="f.fields" (formChange)="onChange($event)" (formSubmit)="onChange($event)" />
            </div>
          </section>

          <!-- Config + value -->
          <section class="panel">
            <div class="panel-head">
              <span><i class="pi pi-code"></i> Field config</span>
              <button type="button" class="copy" (click)="copyCode(f.code)">
                <i class="pi" [class.pi-copy]="!copied()" [class.pi-check]="copied()"></i>
                {{ copied() ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <pre class="code"><code>{{ f.code }}</code></pre>

            <div class="panel-head sub"><span><i class="pi pi-database"></i> Live value</span></div>
            <pre class="value"><code>{{ valueText() }}</code></pre>
          </section>
        </div>

        <nav class="pager">
          @if (prev(); as p) {
            <a [routerLink]="['/fields', p.id]" class="pg prev"><i class="pi pi-chevron-left"></i><span><small>Previous</small>{{ p.title }}</span></a>
          } @else { <span></span> }
          @if (next(); as n) {
            <a [routerLink]="['/fields', n.id]" class="pg next"><span><small>Next</small>{{ n.title }}</span><i class="pi pi-chevron-right"></i></a>
          } @else { <span></span> }
        </nav>
      </div>
    } @else {
      <div class="wrap missing">
        <h1>Field not found</h1>
        <p>No field with id “{{ id() }}”.</p>
        <a class="back" routerLink="/fields"><i class="pi pi-arrow-left"></i> Back to all fields</a>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .wrap { max-width: 1120px; margin: 0 auto; padding: clamp(1.5rem, 4vw, 2.5rem) 1.25rem 4rem; }

      .crumbs { display: flex; align-items: center; gap: 0.5rem; font-size: 0.86rem; color: var(--gray-500,#6b7280); }
      .crumbs a { color: #059669; text-decoration: none; font-weight: 600; }
      .crumbs .sep { opacity: 0.5; }

      .head { display: flex; align-items: flex-start; gap: 1rem; margin-top: 1rem; }
      .head .ic { flex: none; width: 52px; height: 52px; border-radius: 13px; display: grid; place-items: center; background: linear-gradient(135deg,#ecfdf5,#d1fae5); color: #059669; font-size: 1.4rem; }
      .head h1 { font-size: clamp(1.5rem, 3.5vw, 2rem); font-weight: 800; color: var(--gray-900,#111827); letter-spacing: -0.02em; display: flex; align-items: baseline; gap: 0.6rem; flex-wrap: wrap; }
      .head .since { font-size: 0.72rem; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 0.1rem 0.45rem; border-radius: 999px; }
      .head p { margin-top: 0.3rem; color: var(--gray-600,#4b5563); }
      .head .sb { margin-left: auto; flex: none; display: inline-flex; align-items: center; gap: 0.45rem; background: #111827; color: #fff; text-decoration: none; font-weight: 700; font-size: 0.86rem; padding: 0.55rem 0.9rem; border-radius: 9px; }
      .head .sb:hover { box-shadow: 0 8px 18px -8px rgba(17,24,39,0.6); }

      .note { display: flex; align-items: center; gap: 0.5rem; margin-top: 1.25rem; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 0.6rem 0.9rem; border-radius: 10px; font-size: 0.86rem; }
      .note code { background: #fef3c7; padding: 0.05rem 0.35rem; border-radius: 5px; }

      .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.1rem; margin-top: 1.5rem; align-items: start; }
      @media (max-width: 880px) { .cols { grid-template-columns: 1fr; } }

      .panel { background: #fff; border: 1px solid var(--gray-200,#e5e7eb); border-radius: 14px; overflow: hidden; }
      .panel-head { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 1rem; border-bottom: 1px solid var(--gray-200,#e5e7eb); font-size: 0.82rem; font-weight: 700; color: var(--gray-600,#4b5563); background: var(--gray-50,#f9fafb); }
      .panel-head.sub { border-top: 1px solid var(--gray-200,#e5e7eb); }
      .panel-head i { color: #059669; }
      .copy { display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid var(--gray-200,#e5e7eb); background: #fff; color: var(--gray-600,#4b5563); font-size: 0.78rem; font-weight: 600; padding: 0.25rem 0.55rem; border-radius: 7px; cursor: pointer; font-family: inherit; }
      .copy:hover { border-color: #6ee7b7; color: #059669; }

      .preview { padding: 1.25rem; }

      .code, .value { margin: 0; padding: 1rem; background: #0f172a; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.8rem; line-height: 1.5; overflow-x: auto; white-space: pre; }
      .value { background: #0b1220; color: #7dd3fc; max-height: 220px; overflow-y: auto; }

      .pager { display: flex; justify-content: space-between; gap: 1rem; margin-top: 2rem; }
      .pg { display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--gray-700,#374151); background: #fff; border: 1px solid var(--gray-200,#e5e7eb); border-radius: 11px; padding: 0.7rem 1rem; font-weight: 700; }
      .pg:hover { border-color: #6ee7b7; color: #059669; }
      .pg span { display: flex; flex-direction: column; line-height: 1.15; }
      .pg.next span { text-align: right; }
      .pg small { font-size: 0.68rem; font-weight: 600; color: var(--gray-400,#9ca3af); text-transform: uppercase; letter-spacing: 0.04em; }

      .missing { text-align: center; padding-top: 4rem; }
      .missing .back { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 1rem; color: #059669; font-weight: 700; text-decoration: none; }
    `,
  ],
})
export class FieldPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { requireSync: true });

  protected readonly id = computed(() => this.params().get('id') ?? '');
  protected readonly entry = computed(() => findField(this.id()));
  protected readonly copied = signal(false);
  protected readonly lastValue = signal<unknown>(null);

  private readonly idx = computed(() => FIELD_CATALOG.findIndex((f) => f.id === this.id()));
  protected readonly prev = computed(() => { const i = this.idx(); return i > 0 ? FIELD_CATALOG[i - 1] : undefined; });
  protected readonly next = computed(() => { const i = this.idx(); return i >= 0 && i < FIELD_CATALOG.length - 1 ? FIELD_CATALOG[i + 1] : undefined; });

  // Opens the StackBlitz playground with the editable catalog file focused —
  // every field's config lives in src/app/catalog.ts. The running preview
  // boots to the gallery; navigate to this field there to see live edits.
  protected readonly sbUrl = computed(() => `${SB_BASE}?file=src%2Fapp%2Fcatalog.ts`);

  protected readonly valueText = computed(() => {
    const v = this.lastValue();
    if (v == null) return '// interact with the form to see its value';
    return this.safeStringify(v);
  });

  protected onChange(e: FormEngineEvent): void {
    this.lastValue.set(e.values);
  }

  protected copyCode(code: string): void {
    void navigator.clipboard?.writeText(code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    });
  }

  /** TreeNode values (treeSelect) carry parent↔children cycles — drop them. */
  private safeStringify(value: unknown): string {
    const seen = new WeakSet();
    return JSON.stringify(
      value,
      (key, val) => {
        if (key === 'parent') return undefined;
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }
        return val;
      },
      2,
    );
  }
}
