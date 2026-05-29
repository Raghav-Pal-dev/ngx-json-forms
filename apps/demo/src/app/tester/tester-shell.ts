/**
 * Side-nav harness that lets a human (or me) walk through every
 * Tier 1 and Tier 2 feature, verifying they actually render and
 * behave. Mounted at /tester.
 */
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'tester-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="tester-shell">
      <aside class="tester-nav">
        <h3>Tier 1</h3>
        <ul>
          <li><a routerLink="/tester/tier1" routerLinkActive="active">Tier 1 (typed/autosave/debug/JSON Schema)</a></li>
        </ul>
        <h3>Tier 2 — field types</h3>
        <ul>
          <li><a routerLink="/tester/otp"         routerLinkActive="active">otp (1.6.0)</a></li>
          <li><a routerLink="/tester/currency"    routerLinkActive="active">currency (1.7.0)</a></li>
          <li><a routerLink="/tester/tag-input"   routerLinkActive="active">tagInput (1.8.0)</a></li>
          <li><a routerLink="/tester/date-range"  routerLinkActive="active">dateRange (1.9.0)</a></li>
          <li><a routerLink="/tester/signature"   routerLinkActive="active">signature (1.10.0)</a></li>
          <li><a routerLink="/tester/address"     routerLinkActive="active">address (1.11.0)</a></li>
          <li><a routerLink="/tester/drag-upload" routerLinkActive="active">dragUpload (1.12.0)</a></li>
          <li><a routerLink="/tester/tree-select" routerLinkActive="active">treeSelect (1.13.0)</a></li>
          <li><a routerLink="/tester/time-slots"  routerLinkActive="active">timeSlots (1.14.0)</a></li>
          <li><a routerLink="/tester/markdown"    routerLinkActive="active">markdown (1.15.0)</a></li>
          <li><a routerLink="/tester/captcha"     routerLinkActive="active">captcha (1.16.0)</a></li>
          <li><a routerLink="/tester/image-crop"  routerLinkActive="active">imageCrop (1.17.0)</a></li>
          <li><a routerLink="/tester/phone-intl"  routerLinkActive="active">phoneIntl (1.18.0)</a></li>
          <li><a routerLink="/tester/code"        routerLinkActive="active">code (1.19.0)</a></li>
        </ul>
        <h3>Earlier scenarios</h3>
        <ul>
          <li><a routerLink="/tester/simple"            routerLinkActive="active">simple</a></li>
          <li><a routerLink="/tester/conditional"       routerLinkActive="active">conditional</a></li>
          <li><a routerLink="/tester/repeater"          routerLinkActive="active">repeater</a></li>
          <li><a routerLink="/tester/wizard"            routerLinkActive="active">wizard</a></li>
          <li><a routerLink="/tester/computed"          routerLinkActive="active">computed</a></li>
          <li><a routerLink="/tester/custom-validator"  routerLinkActive="active">custom validator</a></li>
        </ul>
      </aside>
      <main class="tester-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host { display: block; min-height: 100vh; background: #fafafa; }
      .tester-shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
      .tester-nav {
        background: #18181b;
        color: #e4e4e7;
        padding: 1rem;
        overflow-y: auto;
        position: sticky;
        top: 0;
        max-height: 100vh;
      }
      .tester-nav h3 {
        margin: 1.25rem 0 0.25rem;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #a1a1aa;
      }
      .tester-nav h3:first-child { margin-top: 0; }
      .tester-nav ul { list-style: none; padding: 0; margin: 0; }
      .tester-nav li { margin: 0.1rem 0; }
      .tester-nav a {
        display: block;
        padding: 0.35rem 0.6rem;
        border-radius: 4px;
        color: inherit;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .tester-nav a:hover { background: #27272a; }
      .tester-nav a.active { background: #2563eb; color: white; }
      .tester-main { padding: 0; overflow: auto; }
    `,
  ],
})
export class TesterShellComponent {}
