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
        <li><a routerLink="/currency">Currency</a> — locale-aware USD / EUR / INR / JPY (1.7.0)</li>
        <li><a routerLink="/tag-input">Tag input</a> — chip-style tokens / emails (1.8.0)</li>
        <li><a routerLink="/date-range">Date range</a> — check-in / check-out picker + endAfterStart validator (1.9.0)</li>
        <li><a routerLink="/signature">Signature</a> — canvas pad → PNG data URL (1.10.0)</li>
        <li><a routerLink="/address">Address</a> — composite group (line1/2, city, state, postal, country) (1.11.0)</li>
        <li><a routerLink="/drag-upload">Drag upload</a> — full dropzone with file queue + Upload/Cancel (1.12.0)</li>
        <li><a routerLink="/tree-select">Tree select</a> — hierarchical single / multiple / checkbox tree (1.13.0)</li>
        <li><a routerLink="/time-slots">Time slots</a> — appointment-style button grid (1.14.0)</li>
      </ul>
    </div>
  `,
})
export class HomeComponent {}
