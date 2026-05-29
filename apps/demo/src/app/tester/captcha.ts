import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

@Component({
  selector: 'playground-captcha',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>Captcha field (1.16.0)</h1>
      <p class="muted">
        Cloudflare Turnstile — free, GDPR-friendly, zero bundle
        cost (loaded via script tag on first mount). Sitekey below
        is Cloudflare's public <b>test</b> key
        (<code>1x00000000000000000000AA</code>) which always passes
        without showing a challenge. Swap in your real sitekey
        from the Cloudflare dashboard for production.
      </p>
      <p class="muted">
        <b>Important:</b> the token below is for client-side flow
        only. Your backend MUST verify it against
        <code>https://challenges.cloudflare.com/turnstile/v0/siteverify</code>
        before trusting the submission.
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ truncated(e.values) | json }}</pre>
      }
    </div>
  `,
})
export class CaptchaComponent {
  protected readonly fields = signal<FormField[]>([
    presets.email({ formControlName: 'email', label: 'Email', required: true }),
    presets.text({
      formControlName: 'message',
      label: 'Message',
      required: true,
      minLength: 10,
    }),
    presets.captcha({
      sitekey: '1x00000000000000000000AA', // ALWAYS-PASSES test key
      label: 'Prove you are human',
      action: 'contact',
    }),
    presets.submit({ label: 'Send' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }

  /** Token strings are long — truncate for readability. */
  protected truncated(values: Record<string, unknown>) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      out[k] = typeof v === 'string' && v.length > 40
        ? `${v.slice(0, 40)}… (${v.length} chars)`
        : v;
    }
    return out;
  }
}
