import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { FormEngineService } from '@ngx-json-forms/core';

/**
 * Drop-in devtool panel that shows the live state of any
 * `<ngx-json-form>` rendered in the same injector tree. Useful when
 * developing schemas; can be left out of production builds.
 *
 * @example
 * <ngx-json-form [fieldsInput]="fields()" />
 * <ngx-json-form-debug />   <!-- shows value + validity + errors -->
 *
 * The panel is collapsed by default. Pass `[startOpen]="true"` to show
 * it immediately, or `[position]="'inline'"` to embed it in flow instead
 * of pinning to the bottom-right corner.
 */
@Component({
  selector: 'ngx-json-form-debug',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [JsonPipe],
  styles: [
    `
      :host {
        --bg:     #0f172a;
        --fg:     #e2e8f0;
        --muted:  #94a3b8;
        --green:  #22c55e;
        --red:    #ef4444;
        --amber:  #f59e0b;
        --border: #1e293b;
      }
      .panel {
        font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.72rem;
        color: var(--fg);
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        overflow: hidden;
      }
      .panel.floating {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 9999;
        max-width: 380px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        user-select: none;
      }
      .header > .title { flex: 1; font-weight: 600; letter-spacing: 0.02em; }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 2px 8px;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.65rem;
        text-transform: uppercase;
      }
      .pill.valid   { background: rgba(34,197,94,0.15);  color: var(--green); border: 1px solid rgba(34,197,94,0.35); }
      .pill.invalid { background: rgba(239,68,68,0.15);  color: var(--red);   border: 1px solid rgba(239,68,68,0.35); }
      .pill.dirty   { background: rgba(245,158,11,0.15); color: var(--amber); border: 1px solid rgba(245,158,11,0.35); }
      .body { padding: 0.5rem 0.75rem 0.75rem; max-height: 60vh; overflow: auto; }
      .section-title {
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
        margin: 0.5rem 0 0.25rem;
      }
      pre {
        margin: 0;
        background: rgba(255,255,255,0.03);
        padding: 0.5rem;
        border-radius: 6px;
        line-height: 1.5;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
      .errors li {
        padding: 0.15rem 0;
        color: var(--red);
        list-style: none;
      }
      .errors li code { color: var(--fg); margin-right: 0.4rem; }
      .empty { color: var(--muted); padding: 0.25rem 0; }
      .chev { transition: transform 0.15s ease; }
      .chev.open { transform: rotate(90deg); }
    `,
  ],
  template: `
    <div class="panel" [class.floating]="position() === 'floating'">
      <div class="header" (click)="open.update((v) => !v)">
        <span class="chev" [class.open]="open()">▶</span>
        <span class="title">ngx-json-form-debug</span>
        <span class="pill" [class.valid]="valid()" [class.invalid]="!valid()">
          {{ valid() ? 'valid' : 'invalid' }}
        </span>
        @if (dirty()) {
          <span class="pill dirty">dirty</span>
        }
      </div>

      @if (open()) {
        <div class="body">
          <div class="section-title">value</div>
          <pre>{{ value() | json }}</pre>

          <div class="section-title">errors ({{ errorList().length }})</div>
          @if (errorList().length) {
            <ul class="errors">
              @for (e of errorList(); track e.control) {
                <li><code>{{ e.control }}</code> → {{ e.error }}</li>
              }
            </ul>
          } @else {
            <div class="empty">no errors</div>
          }

          <div class="section-title">controls ({{ controlSummary().length }})</div>
          <pre>{{ controlSummary() | json }}</pre>
        </div>
      }
    </div>
  `,
})
export class NgxJsonFormDebugComponent {
  private readonly formService = inject(FormEngineService);

  readonly position = input<'floating' | 'inline'>('floating');
  readonly startOpen = input(false);

  protected readonly open = signal(this.startOpen());

  protected readonly value = computed(() => this.formService.formValue());
  protected readonly valid = computed(() => this.formService.formValid());

  protected readonly dirty = computed(() => {
    this.formService.patchTick();
    return this.formService.formGroup()?.dirty ?? false;
  });

  protected readonly controlSummary = computed(() => {
    this.formService.patchTick();
    const group = this.formService.formGroup();
    if (!group) return [];
    return Object.entries(group.controls).map(([name, ctrl]) => ({
      name,
      valid: ctrl.valid,
      dirty: ctrl.dirty,
      touched: ctrl.touched,
      pending: ctrl.pending,
    }));
  });

  protected readonly errorList = computed(() => {
    this.formService.patchTick();
    const group = this.formService.formGroup();
    if (!group) return [];
    const out: { control: string; error: string }[] = [];
    for (const [name, ctrl] of Object.entries(group.controls)) {
      if (!ctrl.errors) continue;
      for (const key of Object.keys(ctrl.errors)) {
        out.push({ control: name, error: key });
      }
    }
    return out;
  });
}
