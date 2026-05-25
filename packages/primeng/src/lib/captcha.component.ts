/**
 * Cloudflare Turnstile captcha wrapper. Lazy-loads the Turnstile
 * script on first mount (idempotent across multiple captcha
 * instances on the same page), renders the widget into the host
 * element, and surfaces the verification token as the form value.
 *
 * Why Turnstile over hCaptcha / reCAPTCHA:
 *  - Free, no rate limits
 *  - No T&S / GDPR baggage (no third-party cookies, no IP logging by default)
 *  - Smaller and faster than reCAPTCHA
 *  - Cloudflare provides public *test* sitekeys for development:
 *      `1x00000000000000000000AA`  — always passes (visible)
 *      `2x00000000000000000000AB`  — always fails
 *
 * Consumers who specifically need hCaptcha or reCAPTCHA can register
 * a custom renderer through `FieldRegistry.registerRenderer('captcha',
 *  CustomImpl)` and override the field type. We pick one default
 * implementation rather than carrying the surface area of three.
 *
 * Implements `ControlValueAccessor` so the verification token flows
 * into the form like any other field value. Backend MUST verify the
 * token against Cloudflare's `/siteverify` endpoint — the front-end
 * widget alone is not enough.
 *
 * @since 1.16.0
 */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  inject,
  input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TURNSTILE_SCRIPT_ID = 'ngx-turnstile-loader';

/** Subset of the Turnstile API we actually call. */
interface TurnstileApi {
  render(
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      'timeout-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
      size?: 'normal' | 'compact' | 'flexible';
      action?: string;
      cdata?: string;
    }
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Single load promise shared across all Captcha instances on the page. */
let loadPromise: Promise<TurnstileApi | null> | null = null;

function loadTurnstileOnce(): Promise<TurnstileApi | null> {
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<TurnstileApi | null>((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(null);
      return;
    }
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile ?? null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return loadPromise;
}

@Component({
  selector: 'ngx-captcha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CaptchaComponent),
      multi: true,
    },
  ],
  styles: [
    `
      :host { display: inline-block; }
      .ngx-captcha-warn {
        color: var(--p-text-muted-color, #71717a);
        font-style: italic;
      }
    `,
  ],
  template: `
    <div #widget></div>
    @if (failed) {
      <p class="ngx-captcha-warn">
        Captcha failed to load. Refresh the page or check your network.
      </p>
    }
  `,
})
export class CaptchaComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  /** Cloudflare Turnstile sitekey. Required. Use `1x00000000000000000000AA` for dev. */
  readonly sitekey = input.required<string>();
  /** Widget theme. Defaults to `'auto'` (follows system / @media). */
  readonly theme = input<'light' | 'dark' | 'auto'>('auto');
  /** Widget size. `'flexible'` adapts to container width. */
  readonly size = input<'normal' | 'compact' | 'flexible'>('normal');
  /** Optional action label (sent to Cloudflare for analytics / risk scoring). */
  readonly action = input<string | undefined>(undefined);

  @ViewChild('widget', { static: true })
  private widgetRef!: ElementRef<HTMLDivElement>;

  private readonly host = inject(ElementRef);
  private widgetId: string | null = null;
  private turnstile: TurnstileApi | null = null;
  protected failed = false;

  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  async ngAfterViewInit(): Promise<void> {
    this.turnstile = await loadTurnstileOnce();
    if (!this.turnstile) {
      this.failed = true;
      this.host.nativeElement.dispatchEvent(new Event('captchaerror'));
      return;
    }
    this.widgetId = this.turnstile.render(this.widgetRef.nativeElement, {
      sitekey: this.sitekey(),
      theme: this.theme(),
      size: this.size(),
      action: this.action(),
      callback: (token) => {
        this.onChange(token);
        this.onTouched();
      },
      'expired-callback': () => {
        this.onChange(null);
        this.onTouched();
      },
      'error-callback': () => {
        this.onChange(null);
        this.onTouched();
      },
      'timeout-callback': () => {
        this.onChange(null);
        this.onTouched();
      },
    });
  }

  ngOnDestroy(): void {
    if (this.widgetId && this.turnstile) {
      try {
        this.turnstile.remove(this.widgetId);
      } catch {
        /* widget already torn down — fine */
      }
    }
  }

  // ── ControlValueAccessor ──

  /**
   * Programmatic value writes (e.g. form.reset()) should reset the
   * widget so the user has to solve a fresh challenge.
   */
  writeValue(value: string | null): void {
    if (value === null && this.widgetId && this.turnstile) {
      try {
        this.turnstile.reset(this.widgetId);
      } catch {
        /* not yet rendered — ignore */
      }
    }
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
