import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATEGORIES, FIELD_CATALOG, FieldCategory, FieldDemo } from '../catalog';

/**
 * Searchable, filterable gallery of every field type. Cards link to the
 * per-field showcase page. Search matches title + blurb + id; category pills
 * narrow by group.
 */
@Component({
  selector: 'demo-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="wrap">
      <header class="head">
        <h1>Field catalog</h1>
        <p>{{ total }} field types — click any to see a live preview, copy the config, or open it in StackBlitz.</p>
      </header>

      <div class="controls">
        <div class="search">
          <i class="pi pi-search"></i>
          <input
            type="text"
            placeholder="Search fields… (e.g. date, phone, upload)"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
            aria-label="Search fields"
          />
          @if (query()) {
            <button type="button" class="clear" (click)="query.set('')" aria-label="Clear search"><i class="pi pi-times"></i></button>
          }
        </div>
        <div class="pills">
          <button type="button" [class.on]="cat() === 'All'" (click)="cat.set('All')">All</button>
          @for (c of categories; track c) {
            <button type="button" [class.on]="cat() === c" (click)="cat.set(c)">{{ c }}</button>
          }
        </div>
      </div>

      @if (visible().length === 0) {
        <p class="empty"><i class="pi pi-inbox"></i> No fields match “{{ query() }}”.</p>
      }

      @for (group of grouped(); track group.cat) {
        <section class="group">
          <h2>{{ group.cat }} <span class="count">{{ group.items.length }}</span></h2>
          <div class="grid">
            @for (f of group.items; track f.id) {
              <a class="card" [routerLink]="['/fields', f.id]">
                <div class="card-top">
                  <span class="ic"><i [class]="'pi ' + f.icon"></i></span>
                  @if (f.since) { <span class="since">{{ f.since }}</span> }
                </div>
                <h3>{{ f.title }}</h3>
                <p>{{ f.blurb }}</p>
                @if (f.peer) { <span class="peer"><i class="pi pi-box"></i> {{ f.peer }}</span> }
                <span class="go">Try it <i class="pi pi-arrow-right"></i></span>
              </a>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .wrap { max-width: 1120px; margin: 0 auto; padding: clamp(2rem, 5vw, 3rem) 1.25rem 4rem; }
      .head h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; color: var(--gray-900, #111827); letter-spacing: -0.02em; }
      .head p { margin-top: 0.4rem; color: var(--gray-600, #4b5563); font-size: 1rem; }

      .controls { position: sticky; top: 64px; z-index: 10; background: linear-gradient(var(--gray-50,#f9fafb), var(--gray-50,#f9fafb) 70%, transparent); padding: 1.25rem 0 0.75rem; margin: 1.5rem 0 0.5rem; }
      .search { position: relative; max-width: 480px; }
      .search > .pi-search { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--gray-400, #9ca3af); }
      .search input {
        width: 100%; padding: 0.7rem 2.4rem; border: 1px solid var(--gray-300, #d1d5db); border-radius: 10px;
        font-size: 0.95rem; font-family: inherit; background: #fff; outline: none;
      }
      .search input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
      .clear { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); border: none; background: var(--gray-100,#f3f4f6); color: var(--gray-500,#6b7280); width: 26px; height: 26px; border-radius: 6px; cursor: pointer; }
      .clear:hover { background: var(--gray-200,#e5e7eb); }

      .pills { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.8rem; }
      .pills button {
        border: 1px solid var(--gray-200, #e5e7eb); background: #fff; color: var(--gray-600, #4b5563);
        padding: 0.35rem 0.8rem; border-radius: 999px; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit;
      }
      .pills button:hover { border-color: #6ee7b7; }
      .pills button.on { background: #059669; border-color: #059669; color: #fff; }

      .empty { text-align: center; color: var(--gray-500, #6b7280); padding: 3rem 0; }

      .group { margin-top: 2rem; }
      .group h2 { font-size: 1.1rem; color: var(--gray-800, #1f2937); display: flex; align-items: center; gap: 0.5rem; }
      .group .count { font-size: 0.72rem; font-weight: 700; color: var(--gray-500,#6b7280); background: var(--gray-100,#f3f4f6); border-radius: 999px; padding: 0.05rem 0.45rem; }

      .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(248px, 1fr)); gap: 0.9rem; margin-top: 0.9rem; }
      .card {
        position: relative; display: block; background: #fff; border: 1px solid var(--gray-200, #e5e7eb);
        border-radius: 14px; padding: 1.1rem; text-decoration: none; transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
      }
      .card:hover { transform: translateY(-2px); border-color: #6ee7b7; box-shadow: 0 12px 26px -14px rgba(16,185,129,0.55); }
      .card-top { display: flex; align-items: center; justify-content: space-between; }
      .ic { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: #ecfdf5; color: #059669; font-size: 1.05rem; }
      .since { font-size: 0.68rem; font-weight: 700; color: var(--gray-400,#9ca3af); }
      .card h3 { margin: 0.8rem 0 0.3rem; font-size: 1rem; color: var(--gray-900, #111827); }
      .card p { margin: 0; font-size: 0.85rem; line-height: 1.5; color: var(--gray-600, #4b5563); min-height: 2.5em; }
      .peer { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.6rem; font-size: 0.7rem; font-weight: 600; color: #b45309; background: #fffbeb; border: 1px solid #fde68a; padding: 0.1rem 0.4rem; border-radius: 6px; }
      .go { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.75rem; color: #059669; font-weight: 700; font-size: 0.82rem; }
      .card:hover .go i { transform: translateX(3px); }
      .go i { transition: transform 0.12s ease; }
    `,
  ],
})
export class GalleryComponent {
  protected readonly total = FIELD_CATALOG.length;
  protected readonly categories = CATEGORIES;
  protected readonly query = signal('');
  protected readonly cat = signal<FieldCategory | 'All'>('All');

  protected readonly visible = computed<FieldDemo[]>(() => {
    const q = this.query().trim().toLowerCase();
    const c = this.cat();
    return FIELD_CATALOG.filter((f) => {
      if (c !== 'All' && f.category !== c) return false;
      if (!q) return true;
      return (f.title + ' ' + f.blurb + ' ' + f.id).toLowerCase().includes(q);
    });
  });

  protected readonly grouped = computed(() => {
    const items = this.visible();
    return CATEGORIES.map((cat) => ({ cat, items: items.filter((f) => f.category === cat) })).filter(
      (g) => g.items.length > 0,
    );
  });
}
