/**
 * Exercises every Tier 1 enhancement at once so the tester can
 * verify them on one page:
 *   - defineForm<T>()                  (typed FormField[])
 *   - presets.*                        (factory helpers)
 *   - schema.persistKey                (auto-save / restore on refresh)
 *   - <ngx-json-form-debug>            (inspector panel)
 *   - formFieldsFromJsonSchema()       (JSON Schema interop)
 */
import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  NgxJsonFormComponent,
  NgxJsonFormDebugComponent,
} from '@ngx-json-forms/primeng';
import {
  FormEngineEvent,
  FormSchema,
  defineForm,
  formFieldsFromJsonSchema,
  presets,
} from '@ngx-json-forms/core';

interface ProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
}

const PROFILE_SCHEMA: FormSchema = {
  formId: 'tier1-profile',
  persistKey: 'tier1-profile-autosave',
  title: 'Profile (Tier 1: typed + auto-save + debug)',
  description:
    'Refresh the page — the values come back. Open the floating debug panel bottom-right.',
  fields: defineForm<ProfileDto>([
    presets.text({ formControlName: 'firstName', label: 'First name', required: true, minLength: 2, columnSpan: 6 }),
    presets.text({ formControlName: 'lastName',  label: 'Last name',  required: true,                 columnSpan: 6 }),
    presets.email({ formControlName: 'email',    label: 'Email' }),
    presets.phone({ formControlName: 'phone',    label: 'Phone (basic)' }),
    presets.text({  formControlName: 'bio',      label: 'Short bio', maxLength: 240 }),
    presets.submit({ label: 'Save profile' }),
  ]),
};

// JSON Schema interop demo — same shape as PROFILE_SCHEMA, derived from
// a JSON Schema document instead of hand-written FormField[].
const JSON_SCHEMA_DOC = {
  title: 'Account (from JSON Schema)',
  type: 'object',
  required: ['email', 'plan'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      title: 'Email',
    },
    plan: {
      type: 'string',
      title: 'Plan',
      enum: ['free', 'pro', 'enterprise'],
    },
    seats: {
      type: 'integer',
      title: 'Seats',
      minimum: 1,
      maximum: 100,
    },
    optInUpdates: {
      type: 'boolean',
      title: 'Email me product updates',
    },
  },
} as const;

@Component({
  selector: 'tester-tier1',
  imports: [NgxJsonFormComponent, NgxJsonFormDebugComponent, JsonPipe],
  template: `
    <h1>Tier 1 — typed form + auto-save + debug + JSON Schema</h1>

    <h2>1. Typed FormField + auto-save + inspector</h2>
    <p>
      <code>defineForm&lt;ProfileDto&gt;([…])</code> +
      <code>schema.persistKey</code>. Fill values, refresh the page —
      they come back. Bottom-right: floating debug panel from
      <code>&lt;ngx-json-form-debug&gt;</code>.
    </p>
    <ngx-json-form
      [schema]="schema"
      (formSubmit)="onProfileSubmit($event)"
      (formChange)="onProfileChange($event)"
    />

    @if (lastProfile(); as p) {
      <h3>Last profile event ({{ p.type }})</h3>
      <pre>{{ p.values | json }}</pre>
    }

    <hr />

    <h2>2. JSON Schema interop</h2>
    <p>
      <code>formFieldsFromJsonSchema(...)</code> turns this draft-7
      schema into <code>FormField[]</code> with no glue code.
    </p>
    <pre class="schema-pre">{{ jsonSchemaSource() | json }}</pre>
    <ngx-json-form
      [fieldsInput]="jsonSchemaFields()"
      (formSubmit)="onAccountSubmit($event)"
    />

    @if (lastAccount(); as a) {
      <h3>Last account event ({{ a.type }})</h3>
      <pre>{{ a.values | json }}</pre>
    }

    <!-- Floating inspector for the profile form. -->
    <ngx-json-form-debug position="floating" />
  `,
  styles: [
    `
      :host { display: block; max-width: 920px; margin: 0 auto; padding: 1.5rem; }
      h1 { margin-top: 0; }
      h2 { margin-top: 2rem; }
      pre { background: #f4f4f5; padding: 0.75rem; border-radius: 6px; max-height: 16rem; overflow: auto; }
      .schema-pre { font-size: 0.8rem; }
      hr { margin: 2.5rem 0; border: none; border-top: 1px solid #e4e4e7; }
    `,
  ],
})
export class Tier1Component {
  protected readonly schema = PROFILE_SCHEMA;

  protected readonly jsonSchemaSource = signal(JSON_SCHEMA_DOC);
  protected readonly jsonSchemaFields = signal(
    formFieldsFromJsonSchema(JSON_SCHEMA_DOC as unknown as Parameters<typeof formFieldsFromJsonSchema>[0]),
  );

  protected readonly lastProfile = signal<FormEngineEvent | null>(null);
  protected readonly lastAccount = signal<FormEngineEvent | null>(null);

  protected onProfileSubmit(e: FormEngineEvent): void { this.lastProfile.set(e); }
  protected onProfileChange(e: FormEngineEvent): void { this.lastProfile.set(e); }
  protected onAccountSubmit(e: FormEngineEvent): void { this.lastAccount.set(e); }
}
