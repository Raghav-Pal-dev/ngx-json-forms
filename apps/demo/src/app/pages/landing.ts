import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FIELD_CATALOG } from '../catalog';

/**
 * Marketing landing: hero + install + feature highlights + "what's inside".
 * Pure presentational — no form engine on this page (keeps first paint fast).
 */
@Component({
  selector: 'demo-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-inner">
        <span class="eyebrow"><i class="pi pi-bolt"></i> Angular 21 · PrimeNG · zero template code</span>
        <h1>Build any Angular form from <span class="grad">JSON</span>.</h1>
        <p class="lede">
          Describe your fields as a config array — <code>ngx-json-forms</code> renders a fully
          reactive, validated PrimeNG form. {{ fieldCount }} field types, conditional logic,
          computed values, repeaters and multi-step wizards. No template markup.
        </p>

        <div class="install">
          <code>npm i &#64;ngx-json-forms/core &#64;ngx-json-forms/primeng</code>
          <button class="copy" type="button" (click)="copyInstall()" [attr.aria-label]="'Copy install command'">
            <i class="pi" [class.pi-copy]="!copied()" [class.pi-check]="copied()"></i>
          </button>
        </div>

        <div class="hero-cta">
          <a class="btn primary" routerLink="/fields"><i class="pi pi-th-large"></i> Browse {{ fieldCount }} fields</a>
          <a class="btn dark" href="https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz" target="_blank" rel="noopener">
            <i class="pi pi-external-link"></i> Open in StackBlitz
          </a>
        </div>
      </div>
    </section>

    <section class="features">
      @for (f of features; track f.title) {
        <article class="feature">
          <div class="f-icon"><i [class]="'pi ' + f.icon"></i></div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.body }}</p>
        </article>
      }
    </section>

    <section class="inside">
      <div class="inside-head">
        <h2>Every field, one config shape</h2>
        <a class="see-all" routerLink="/fields">See all {{ fieldCount }} <i class="pi pi-arrow-right"></i></a>
      </div>
      <div class="chips">
        @for (f of preview; track f.id) {
          <a class="chip" [routerLink]="['/fields', f.id]"><i [class]="'pi ' + f.icon"></i> {{ f.title }}</a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host { display: block; }

      .hero { padding: clamp(3rem, 8vw, 6rem) 1.25rem clamp(2rem, 5vw, 3.5rem); text-align: center;
        background:
          radial-gradient(60rem 30rem at 50% -10%, #ecfdf5 0%, transparent 60%),
          radial-gradient(40rem 20rem at 90% 0%, #eff6ff 0%, transparent 55%);
      }
      .hero-inner { max-width: 800px; margin: 0 auto; }
      .eyebrow {
        display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700;
        color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 0.35rem 0.8rem; border-radius: 999px;
      }
      h1 { font-size: clamp(2.2rem, 6vw, 3.6rem); line-height: 1.05; font-weight: 800; letter-spacing: -0.02em;
        margin: 1.25rem 0 0; color: var(--gray-900, #111827); }
      .grad { background: linear-gradient(120deg, #10b981, #2563eb); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .lede { margin: 1rem auto 0; max-width: 620px; font-size: 1.08rem; line-height: 1.6; color: var(--gray-600, #4b5563); }
      .lede code { background: var(--gray-100, #f3f4f6); padding: 0.1rem 0.35rem; border-radius: 5px; font-size: 0.95em; }

      .install {
        display: inline-flex; align-items: center; gap: 0.5rem; margin: 1.75rem auto 0;
        background: #0f172a; color: #e2e8f0; padding: 0.6rem 0.6rem 0.6rem 1rem; border-radius: 10px;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.86rem; max-width: 100%;
      }
      .install code { white-space: nowrap; overflow-x: auto; }
      .copy { background: #1e293b; color: #94a3b8; border: none; width: 32px; height: 32px; border-radius: 7px; cursor: pointer; flex: none; }
      .copy:hover { background: #334155; color: #fff; }

      .hero-cta { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 1.75rem; }
      .btn {
        display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.25rem; border-radius: 10px;
        text-decoration: none; font-weight: 700; font-size: 0.95rem; transition: transform 0.12s ease, box-shadow 0.12s ease;
      }
      .btn:hover { transform: translateY(-1px); }
      .btn.primary { background: linear-gradient(135deg, #10b981, #059669); color: #fff; box-shadow: 0 10px 22px -8px rgba(16,185,129,0.6); }
      .btn.dark { background: #111827; color: #fff; box-shadow: 0 10px 22px -10px rgba(17,24,39,0.6); }

      .features {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;
        max-width: 1080px; margin: 0 auto; padding: 1rem 1.25rem 2rem;
      }
      .feature { background: #fff; border: 1px solid var(--gray-200, #e5e7eb); border-radius: 14px; padding: 1.4rem; }
      .f-icon { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; background: #ecfdf5; color: #059669; font-size: 1.1rem; }
      .feature h3 { margin: 0.9rem 0 0.35rem; font-size: 1.02rem; color: var(--gray-900, #111827); }
      .feature p { margin: 0; font-size: 0.9rem; line-height: 1.55; color: var(--gray-600, #4b5563); }

      .inside { max-width: 1080px; margin: 0 auto; padding: 1rem 1.25rem 4rem; }
      .inside-head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
      .inside-head h2 { font-size: 1.4rem; color: var(--gray-900, #111827); }
      .see-all { color: #059669; font-weight: 700; text-decoration: none; font-size: 0.92rem; white-space: nowrap; }
      .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.1rem; }
      .chip {
        display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.45rem 0.8rem; border-radius: 999px;
        background: #fff; border: 1px solid var(--gray-200, #e5e7eb); color: var(--gray-700, #374151);
        text-decoration: none; font-size: 0.86rem; font-weight: 600;
      }
      .chip:hover { border-color: #6ee7b7; background: #ecfdf5; color: #059669; }
      .chip i { color: #059669; }
    `,
  ],
})
export class LandingComponent {
  protected readonly fieldCount = FIELD_CATALOG.length;
  protected readonly preview = FIELD_CATALOG.slice(0, 16);
  protected readonly copied = signal(false);

  protected readonly features = [
    { icon: 'pi-code', title: 'Config, not templates', body: 'A FormField[] array drives the whole form. Store it, version it, or fetch it from an API.' },
    { icon: 'pi-check-circle', title: 'Validation built in', body: 'Required, min/max, pattern, email, cross-field matches, plus async validators — declared in JSON.' },
    { icon: 'pi-eye', title: 'Conditional & computed', body: 'showWhen visibility, disableWhen, and derived computed fields recompute live.' },
    { icon: 'pi-objects-column', title: 'Groups, repeaters, wizards', body: 'Nested FormGroups, FormArray repeaters and multi-step steppers with per-step validation.' },
    { icon: 'pi-palette', title: 'PrimeNG look & feel', body: 'Renders native PrimeNG controls — theme it with any PrimeNG preset; tracks your primary color.' },
    { icon: 'pi-bolt', title: 'Tiny + tree-shaken', body: 'Heavy field deps (quill, cropperjs, codemirror…) are optional peers, dynamically imported only when used.' },
  ];

  protected copyInstall(): void {
    void navigator.clipboard
      ?.writeText('npm i @ngx-json-forms/core @ngx-json-forms/primeng')
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 1600);
      });
  }
}
