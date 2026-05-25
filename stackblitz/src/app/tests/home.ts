import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'playground-home',
  imports: [RouterLink],
  template: `
    <div class="card">
      <h1>ngx-json-forms playground</h1>
      <p class="muted">
        Open <code>src/app/tests/*.ts</code> in the file tree and edit any
        field def — the form on the right re-renders instantly. Every
        scenario uses the published <code>&#64;ngx-json-forms/{{ '{' }}core,primeng{{ '}' }}</code>
        from npm; no local build needed.
      </p>
      <ul>
        <li><a routerLink="/simple">Simple</a> — basic text + email</li>
        <li><a routerLink="/conditional">Conditional</a> — <code>showWhen</code></li>
        <li><a routerLink="/repeater">Repeater</a> — FormArray with min/max</li>
        <li><a routerLink="/wizard">Wizard</a> — 3-step stepper</li>
        <li><a routerLink="/computed">Computed</a> — derived + transient field</li>
        <li><a routerLink="/custom-validator">Custom validator</a> — inline async validator</li>
        <li><a routerLink="/otp">OTP</a> — verification code / PIN / backup code (1.6.0)</li>
      </ul>
    </div>
  `,
})
export class HomeComponent {}
