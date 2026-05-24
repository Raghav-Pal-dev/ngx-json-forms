import {
  ChangeDetectionStrategy, Component, computed,
  inject, signal, OnInit
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import {
  FieldRegistry,
  FormEngineEvent,
  FormEngineService,
  FormField,
} from '@ngx-json-forms/core';

const DEFAULT_FIELDS: FormField[] = [
  {
    formControlName: 'firstName',
    label: 'First Name',
    placeholder: 'e.g. John',
    config: {
      attributes: {
        inputType: 'text', type: 'text', visible: true,
        fieldIcon: 'pi pi-user', fieldPos: 'left',
        acceptedEvents: ['change', 'blur'],
      },
    },
    validations: {
      rules: { required: true, minLength: 2 },
      messages: { required: 'First name is required', minLength: 'At least 2 characters' },
    },
    layout: { columnSpan: 6, order: 1 },
  },
  {
    formControlName: 'lastName',
    label: 'Last Name',
    placeholder: 'e.g. Doe',
    config: {
      attributes: {
        inputType: 'text', type: 'text', visible: true,
        fieldIcon: 'pi pi-user', fieldPos: 'left',
        acceptedEvents: ['change', 'blur'],
      },
    },
    validations: {
      rules: { required: true },
      messages: { required: 'Last name is required' },
    },
    layout: { columnSpan: 6, order: 2 },
  },
  {
    formControlName: 'email',
    label: 'Email Address',
    placeholder: 'john@example.com',
    config: {
      attributes: {
        inputType: 'text', type: 'email', visible: true,
        fieldIcon: 'pi pi-envelope', fieldPos: 'left',
        acceptedEvents: ['change', 'blur'],
      },
    },
    validations: {
      rules: { required: true, email: true },
      messages: { required: 'Email is required', email: 'Enter a valid email address' },
    },
    layout: { columnSpan: 6, order: 3 },
  },
  {
    formControlName: 'country',
    label: 'Country',
    placeholder: 'Select your country',
    config: {
      attributes: {
        inputType: 'select', visible: true,
        options: [
          { label: '🇮🇳  India', value: 'IN' },
          { label: '🇺🇸  United States', value: 'US' },
          { label: '🇬🇧  United Kingdom', value: 'UK' },
          { label: '🇨🇦  Canada', value: 'CA' },
          { label: '🇦🇺  Australia', value: 'AU' },
          { label: '🇩🇪  Germany', value: 'DE' },
          { label: '🇫🇷  France', value: 'FR' },
          { label: '🇯🇵  Japan', value: 'JP' },
        ],
        optionLabel: 'label', optionValue: 'value',
        filter: true, filterPlaceholder: 'Search country…',
        showClear: true, acceptedEvents: ['change'],
        fieldIcon: 'pi pi-globe', fieldPos: 'left',
      },
    },
    validations: {
      rules: { required: true },
      messages: { required: 'Please select your country' },
    },
    layout: { columnSpan: 6, order: 4 },
  },
  {
    formControlName: 'role',
    label: 'Role',
    placeholder: 'Select your role',
    config: {
      attributes: {
        inputType: 'select', visible: true,
        options: [
          { label: 'Frontend Developer', value: 'frontend' },
          { label: 'Backend Developer', value: 'backend' },
          { label: 'Full Stack Developer', value: 'fullstack' },
          { label: 'UI/UX Designer', value: 'designer' },
          { label: 'Product Manager', value: 'pm' },
          { label: 'DevOps Engineer', value: 'devops' },
        ],
        optionLabel: 'label', optionValue: 'value',
        showClear: true, acceptedEvents: ['change'],
        fieldIcon: 'pi pi-briefcase', fieldPos: 'left',
      },
    },
    validations: {
      rules: { required: true },
      messages: { required: 'Please select your role' },
    },
    layout: { columnSpan: 6, order: 5 },
  },
  {
    formControlName: 'skills',
    label: 'Skills',
    config: {
      attributes: {
        inputType: 'multiSelect', visible: true,
        options: [
          { label: 'Angular', value: 'angular' },
          { label: 'React', value: 'react' },
          { label: 'Vue.js', value: 'vue' },
          { label: 'TypeScript', value: 'ts' },
          { label: 'Node.js', value: 'node' },
          { label: 'Python', value: 'python' },
          { label: 'Docker', value: 'docker' },
          { label: 'GraphQL', value: 'graphql' },
        ],
        optionLabel: 'label', optionValue: 'value',
        placeholder: 'Pick your skills',
        filter: true, showClear: true, display: 'chip',
        acceptedEvents: ['change'],
        fieldIcon: 'pi pi-star', fieldPos: 'left',
      },
    },
    validations: {
      rules: { required: true },
      messages: { required: 'Please select at least one skill' },
    },
    layout: { columnSpan: 6, order: 6 },
  },
  {
    formControlName: 'experience',
    label: 'Years of Experience',
    placeholder: 'Select range',
    config: {
      attributes: {
        inputType: 'select', visible: true,
        options: [
          { label: '0–1 years', value: '0-1' },
          { label: '1–3 years', value: '1-3' },
          { label: '3–5 years', value: '3-5' },
          { label: '5–10 years', value: '5-10' },
          { label: '10+ years', value: '10+' },
        ],
        optionLabel: 'label', optionValue: 'value',
        acceptedEvents: ['change'],
        fieldIcon: 'pi pi-calendar', fieldPos: 'left',
      },
    },
    layout: { columnSpan: 6, order: 7 },
  },
  {
    formControlName: 'bio',
    label: 'Short Bio',
    config: {
      attributes: {
        inputType: 'textarea', visible: true,
        placeholder: 'Tell us a little about yourself and your work…',
        rows: 4, autoResize: true,
        fieldIcon: 'pi pi-pencil', fieldPos: 'left',
        acceptedEvents: ['change', 'blur'],
      },
    },
    layout: { columnSpan: 12, order: 8 },
  },
  {
    formControlName: 'divider1',
    config: {
      attributes: {
        inputType: 'divider', visible: true,
        dividerLayout: 'horizontal', dividerType: 'solid',
        dividerAlign: 'center',
        value: '<span class="divider-label">Preferences</span>',
      },
    },
    layout: { columnSpan: 12, order: 9 },
  },
  {
    formControlName: 'newsletter',
    label: 'Subscribe to newsletter',
    config: {
      attributes: {
        inputType: 'toggle', visible: true, value: true,
        acceptedEvents: ['change'],
        info: 'Get weekly updates on Angular, PrimeNG, and open-source.',
        cardLayout: true,
        cardIcon: 'pi pi-bell',
        cardIconBg: '#dcfce7',
        cardIconColor: '#16a34a',
      },
    },
    layout: { columnSpan: 6, order: 10 },
  },
  {
    formControlName: 'openSource',
    label: 'Open to open-source contributions',
    config: {
      attributes: {
        inputType: 'toggle', visible: true, value: false,
        acceptedEvents: ['change'],
        info: 'Show your interest in contributing to open-source projects.',
        cardLayout: true,
        cardIcon: 'pi pi-star',
        cardIconBg: '#ede9fe',
        cardIconColor: '#7c3aed',
      },
    },
    layout: { columnSpan: 6, order: 11 },
  },
  {
    formControlName: 'fullName',
    label: 'Full Name (computed)',
    placeholder: 'Auto-filled from first + last name',
    transient: true,
    computed: { deps: ['firstName', 'lastName'], fn: 'fullName' },
    config: {
      attributes: {
        inputType: 'text', type: 'text', visible: true,
        readonly: true,
        info: 'Recomputes whenever firstName or lastName changes.',
        fieldIcon: 'pi pi-id-card', fieldPos: 'left',
      },
    },
    layout: { columnSpan: 12, order: 11.5 },
  },
  {
    formControlName: 'contacts',
    label: 'Emergency Contacts',
    config: {
      attributes: {
        inputType: 'repeater',
        minRows: 1,
        addLabel: 'Add contact',
        info: 'Add one or more contacts. Each row is its own FormGroup.',
        itemFields: [
          {
            formControlName: 'name',
            label: 'Name',
            placeholder: 'e.g. Jane',
            config: {
              attributes: {
                inputType: 'text', type: 'text',
                fieldIcon: 'pi pi-user', fieldPos: 'left',
              },
            },
            validations: { rules: { required: true } },
            layout: { columnSpan: 6 },
          },
          {
            formControlName: 'email',
            label: 'Email',
            placeholder: 'jane@example.com',
            config: {
              attributes: {
                inputType: 'text', type: 'email',
                fieldIcon: 'pi pi-envelope', fieldPos: 'left',
              },
            },
            validations: { rules: { required: true, email: true } },
            layout: { columnSpan: 6 },
          },
        ],
        value: [{ name: '', email: '' }],
      },
    },
    layout: { columnSpan: 12, order: 11.7 },
  },
  {
    formControlName: 'submitBtn',
    btnLabel: 'Create Profile',
    config: {
      attributes: {
        inputType: 'button', visible: true,
        buttonRole: 'submit',
        icon: 'pi pi-arrow-right', iconPosition: 'right',
        acceptedEvents: ['click'],
      },
    },
    layout: { columnSpan: 4, order: 12, wrapperClass: 'submit-btn-wrapper' },
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxJsonFormComponent, JsonPipe, FormsModule],
})
export class App implements OnInit {
  protected readonly formService = inject(FormEngineService);
  private readonly fieldRegistry = inject(FieldRegistry);

  // ─── Form state ──────────────────────────────────────────────────────────
  protected readonly activeFields = signal<FormField[]>([...DEFAULT_FIELDS]);
  protected readonly lastEvent = signal<FormEngineEvent | null>(null);
  protected readonly submitted = signal(false);

  // Live signals from the service (always up-to-date, no event needed)
  protected readonly liveValid = computed(() => this.formService.formValid());
  protected readonly liveValues = computed(() => this.formService.formValue());
  protected readonly hasInteracted = signal(false);

  // ─── Tabs ────────────────────────────────────────────────────────────────
  protected readonly activeTab = signal<'form' | 'schema'>('form');

  // ─── JSON Editor ─────────────────────────────────────────────────────────
  protected readonly editorJson = signal(JSON.stringify(DEFAULT_FIELDS, null, 2));
  protected readonly editorError = signal<string | null>(null);
  protected readonly editorDirty = signal(false);

  ngOnInit(): void {
    this.fieldRegistry.registerComputation('fullName', (deps) => {
      const f = (deps['firstName'] as string | undefined)?.trim() ?? '';
      const l = (deps['lastName']  as string | undefined)?.trim() ?? '';
      return [f, l].filter(Boolean).join(' ');
    });
  }

  protected readonly schemaJson = JSON.stringify(DEFAULT_FIELDS.slice(0, 2), null, 2);

  // ─── Form events ─────────────────────────────────────────────────────────
  protected onSubmit(event: FormEngineEvent): void {
    this.hasInteracted.set(true);
    if (event.valid) this.submitted.set(true);
    this.lastEvent.set(event);
  }

  protected onChange(event: FormEngineEvent): void {
    this.hasInteracted.set(true);
    this.lastEvent.set(event);
  }

  protected reset(): void {
    this.submitted.set(false);
    this.hasInteracted.set(false);
    this.lastEvent.set(null);
    this.formService.reset();
  }

  // ─── JSON Editor ─────────────────────────────────────────────────────────
  protected onEditorInput(value: string): void {
    this.editorJson.set(value);
    this.editorDirty.set(true);
    this.editorError.set(null);

    try {
      const parsed = JSON.parse(value) as FormField[];
      if (!Array.isArray(parsed)) throw new Error('Root must be a JSON array');
      this.activeFields.set(parsed);
      this.editorError.set(null);
      this.hasInteracted.set(false);
      this.lastEvent.set(null);
    } catch (e: unknown) {
      this.editorError.set(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  /**
   * Scroll the in-page demo section into view. The app builds with
   * `<base href="/ngx-json-forms/">` for GitHub Pages, so an unmanaged
   * `href="#demo"` anchor would resolve to a full-URL nav. Stopping the
   * default and calling scrollIntoView keeps the user on the same page.
   */
  protected scrollToDemo(event: Event): void {
    event.preventDefault();
    document
      .getElementById('demo')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected resetEditor(): void {
    const json = JSON.stringify(DEFAULT_FIELDS, null, 2);
    this.editorJson.set(json);
    this.editorError.set(null);
    this.editorDirty.set(false);
    this.activeFields.set([...DEFAULT_FIELDS]);
    this.hasInteracted.set(false);
    this.lastEvent.set(null);
  }
}
