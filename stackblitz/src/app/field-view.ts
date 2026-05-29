import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent } from '@ngx-json-forms/core';
import { FIELD_CATALOG, findField } from './catalog';
import { signal } from '@angular/core';

/**
 * Renders one field from the catalog live. Edit `src/app/catalog.ts` (the file
 * StackBlitz opens for you) and this preview updates instantly.
 */
@Component({
  selector: 'pg-field-view',
  imports: [NgxJsonFormComponent, RouterLink, JsonPipe],
  template: `
    @if (entry(); as f) {
      <div class="card">
        <a class="back" routerLink="/"><i class="pi pi-arrow-left"></i> All fields</a>
        <h1>{{ f.title }}</h1>
        <p class="muted">{{ f.blurb }}</p>
        @if (f.peer) { <p class="peer">Needs optional peer: <code>npm i {{ f.peer }}</code></p> }

        <ngx-json-form [fieldsInput]="f.fields" (formChange)="onChange($event)" (formSubmit)="onChange($event)" />

        <h2>Config</h2>
        <pre>{{ f.code }}</pre>

        @if (value()) {
          <h2>Value</h2>
          <pre>{{ value() | json }}</pre>
        }
      </div>
    } @else {
      <div class="card"><a routerLink="/">← Back</a><h1>Unknown field</h1></div>
    }
  `,
})
export class FieldViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  protected readonly entry = computed(() => findField(this.params().get('id') ?? ''));
  protected readonly value = signal<unknown>(null);
  protected readonly all = FIELD_CATALOG;
  protected onChange(e: FormEngineEvent): void { this.value.set(e.values); }
}
