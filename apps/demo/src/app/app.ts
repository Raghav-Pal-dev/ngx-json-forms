import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

/**
 * App shell: one sticky top nav + routed content (landing, field gallery,
 * per-field showcase pages). The nav is the only persistent chrome.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <a class="brand" routerLink="/">
        <span class="brand-mark"><i class="pi pi-bolt"></i></span>
        <span class="brand-text">ngx-json-forms</span>
        <span class="brand-badge">v1.20</span>
      </a>

      <nav class="nav-links">
        <a routerLink="/fields" routerLinkActive="active">Fields</a>
      </nav>

      <div class="nav-actions">
        <a
          class="ghost"
          href="https://www.npmjs.com/package/@ngx-json-forms/primeng"
          target="_blank"
          rel="noopener"
          title="View on npm"
        >
          <i class="pi pi-box"></i><span class="hide-sm">npm</span>
        </a>
        <a
          class="ghost"
          href="https://github.com/Raghav-Pal-dev/ngx-json-forms"
          target="_blank"
          rel="noopener"
          title="Star on GitHub"
        >
          <i class="pi pi-github"></i><span class="hide-sm">GitHub</span>
        </a>
        <a
          class="cta"
          href="https://stackblitz.com/github/Raghav-Pal-dev/ngx-json-forms/tree/main/stackblitz"
          target="_blank"
          rel="noopener"
        >
          <i class="pi pi-external-link"></i><span class="hide-sm"> Open in StackBlitz</span>
        </a>
      </div>
    </header>

    <main class="content"><router-outlet /></main>

    <footer class="site-footer">
      <span>MIT © {{ year }} ngx-json-forms</span>
      <span class="dot">•</span>
      <a href="https://www.npmjs.com/package/@ngx-json-forms/core" target="_blank" rel="noopener">@ngx-json-forms/core</a>
      <span class="dot">•</span>
      <a href="https://www.npmjs.com/package/@ngx-json-forms/primeng" target="_blank" rel="noopener">@ngx-json-forms/primeng</a>
    </footer>
  `,
  styles: [
    `
      :host { min-height: 100vh; display: flex; flex-direction: column; }

      .nav {
        position: sticky; top: 0; z-index: 50;
        display: flex; align-items: center; gap: 1.25rem;
        height: 64px; padding: 0 clamp(1rem, 4vw, 2.5rem);
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: saturate(180%) blur(12px);
        border-bottom: 1px solid var(--gray-200, #e5e7eb);
      }
      .brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: var(--gray-900, #111827); font-weight: 800; font-size: 1.05rem; }
      .brand-mark {
        display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px;
        background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-size: 0.95rem;
        box-shadow: 0 4px 10px -2px rgba(16, 185, 129, 0.5);
      }
      .brand-badge {
        font-size: 0.7rem; font-weight: 700; color: #059669;
        background: #ecfdf5; border: 1px solid #a7f3d0; padding: 0.1rem 0.4rem; border-radius: 999px;
      }
      .nav-links { display: flex; gap: 0.35rem; margin-left: 0.5rem; }
      .nav-links a {
        padding: 0.45rem 0.85rem; border-radius: 8px; text-decoration: none;
        color: var(--gray-600, #4b5563); font-weight: 600; font-size: 0.92rem;
      }
      .nav-links a:hover { background: var(--gray-100, #f3f4f6); color: var(--gray-900, #111827); }
      .nav-links a.active { background: #ecfdf5; color: #059669; }

      .nav-actions { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
      .nav-actions .ghost {
        display: inline-flex; align-items: center; gap: 0.4rem;
        padding: 0.45rem 0.7rem; border-radius: 8px; text-decoration: none;
        color: var(--gray-600, #4b5563); font-weight: 600; font-size: 0.88rem;
      }
      .nav-actions .ghost:hover { background: var(--gray-100, #f3f4f6); color: var(--gray-900, #111827); }
      .nav-actions .cta {
        display: inline-flex; align-items: center; gap: 0.45rem;
        padding: 0.5rem 0.9rem; border-radius: 8px; text-decoration: none;
        background: #111827; color: #fff; font-weight: 700; font-size: 0.88rem;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
      }
      .nav-actions .cta:hover { transform: translateY(-1px); box-shadow: 0 8px 18px -6px rgba(17, 24, 39, 0.5); }

      .content { flex: 1 1 auto; }

      .site-footer {
        display: flex; align-items: center; justify-content: center; gap: 0.6rem; flex-wrap: wrap;
        padding: 2rem 1rem; color: var(--gray-500, #6b7280); font-size: 0.85rem;
        border-top: 1px solid var(--gray-200, #e5e7eb); background: var(--gray-50, #f9fafb);
      }
      .site-footer a { color: var(--gray-600, #4b5563); text-decoration: none; font-weight: 600; }
      .site-footer a:hover { color: #059669; }
      .site-footer .dot { opacity: 0.5; }

      @media (max-width: 680px) {
        .hide-sm { display: none; }
        .nav-links { display: none; }
      }
    `,
  ],
})
export class App {
  protected readonly year = new Date().getFullYear();
}
