import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FIELD_CATALOG, CATEGORIES } from './catalog';

/**
 * StackBlitz home: a simple catalog gallery. Click any field to see it live,
 * then edit `src/app/catalog.ts` to tweak it. Every field config lives in that
 * one file.
 */
@Component({
  selector: 'pg-home',
  imports: [RouterLink],
  template: `
    <div class="card">
      <h1>ngx-json-forms — field catalog</h1>
      <p class="muted">
        {{ all.length }} field types, all driven by a JSON config. Click one to
        preview it, then edit <code>src/app/catalog.ts</code> — the form
        re-renders instantly. Uses the published
        <code>&#64;ngx-json-forms/{{ '{' }}core,primeng{{ '}' }}</code> from npm.
      </p>

      @for (cat of categories; track cat) {
        <h2>{{ cat }}</h2>
        <div class="grid">
          @for (f of byCat(cat); track f.id) {
            <a class="tile" [routerLink]="['/field', f.id]">
              <i [class]="'pi ' + f.icon"></i>
              <strong>{{ f.title }}</strong>
              <span>{{ f.blurb }}</span>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.75rem; margin: 0.5rem 0 1.5rem; }
      .tile { display: block; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 12px; text-decoration: none; color: #111827; background: #fff; }
      .tile:hover { border-color: #6ee7b7; box-shadow: 0 8px 18px -10px rgba(16,185,129,0.5); }
      .tile i { color: #059669; font-size: 1.1rem; }
      .tile strong { display: block; margin: 0.4rem 0 0.2rem; }
      .tile span { font-size: 0.82rem; color: #6b7280; }
    `,
  ],
})
export class CatalogHomeComponent {
  protected readonly all = FIELD_CATALOG;
  protected readonly categories = CATEGORIES;
  protected byCat(cat: string) { return this.all.filter((f) => f.category === cat); }
}
