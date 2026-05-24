import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="top">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
      <a routerLink="/simple"           routerLinkActive="active">Simple</a>
      <a routerLink="/conditional"      routerLinkActive="active">Conditional</a>
      <a routerLink="/repeater"         routerLinkActive="active">Repeater</a>
      <a routerLink="/wizard"           routerLinkActive="active">Wizard</a>
      <a routerLink="/computed"         routerLinkActive="active">Computed</a>
      <a routerLink="/custom-validator" routerLinkActive="active">Custom validator</a>
    </nav>
    <div class="container">
      <router-outlet />
    </div>
  `,
})
export class App {}
