/**
 * `ng g @ngx-json-forms/primeng:form <name> --fields=email,password,...`
 *
 * Scaffolds a typed standalone Angular component pre-wired with a
 * `defineForm<T>()` schema built from the requested field names.
 * Common names (email, password, phone, ...) auto-pick the right
 * preset from `@ngx-json-forms/core`; the rest become text inputs.
 *
 * Output:
 *   src/app/forms/<name>/<name>.ts   (component + typed interface)
 *
 * Idempotent: refuses to overwrite an existing file (prints a hint
 * to delete it first or pick a different name).
 */
import { Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { FormGeneratorSchema } from './schema';

interface FieldSpec {
  /** the raw control name as given by the user */
  controlName: string;
  /** TS type for the typed interface */
  tsType: string;
  /** TS code to produce the FormField */
  generator: string;
}

const SUBMIT_KEYWORDS = new Set([
  'submit',
  'save',
  'create',
  'continue',
  'signup',
  'signin',
  'login',
  'register',
  'send',
]);

const TOGGLE_KEYWORDS = [
  /^remember/,
  /^subscribe/,
  /^accept/,
  /^agree/,
  /^enable/,
  /^opt[-_]?in/,
  /^notify/,
  /^notification/,
  /newsletter$/,
  /terms$/,
];

const EMAIL_KEYWORDS = [/^email$/, /^e[-_]?mail$/, /mail$/];
const PASSWORD_KEYWORDS = [/^pass(word)?$/, /^pwd$/];
const PHONE_KEYWORDS = [/^phone$/, /^mobile$/, /^tel$/, /^whatsapp$/, /^cell$/];
const NAME_KEYWORDS = [/name$/i];

function inferField(rawName: string, isLast: boolean): FieldSpec {
  const name = rawName.trim();
  if (!name) {
    throw new SchematicsException(`Empty field name in --fields list`);
  }
  const lower = name.toLowerCase();

  // Submit button (always last; auto-detected by name keyword too)
  if (SUBMIT_KEYWORDS.has(lower) || (isLast && lower.includes('submit'))) {
    const label = lower === 'submit' ? 'Submit' : capitalise(lower);
    return {
      controlName: name,
      tsType: '',
      generator: `presets.submit({ formControlName: '${name}', label: '${label}' })`,
    };
  }

  // Toggle (boolean)
  if (TOGGLE_KEYWORDS.some((p) => p.test(lower))) {
    return {
      controlName: name,
      tsType: 'boolean',
      generator:
        `{\n` +
        `      formControlName: '${name}',\n` +
        `      label: '${humanise(name)}',\n` +
        `      config: {\n` +
        `        attributes: {\n` +
        `          inputType: 'toggle',\n` +
        `          value: false,\n` +
        `          acceptedEvents: ['change'],\n` +
        `        },\n` +
        `      },\n` +
        `      layout: { columnSpan: 12 },\n` +
        `    }`,
    };
  }

  if (EMAIL_KEYWORDS.some((p) => p.test(lower))) {
    return {
      controlName: name,
      tsType: 'string',
      generator: `presets.email({ formControlName: '${name}', label: '${humanise(name)}' })`,
    };
  }

  if (PASSWORD_KEYWORDS.some((p) => p.test(lower))) {
    return {
      controlName: name,
      tsType: 'string',
      generator: `presets.password({ formControlName: '${name}', label: '${humanise(name)}', strong: true })`,
    };
  }

  if (PHONE_KEYWORDS.some((p) => p.test(lower))) {
    return {
      controlName: name,
      tsType: 'string',
      generator: `presets.phone({ formControlName: '${name}', label: '${humanise(name)}' })`,
    };
  }

  // Plain text. If it's a name field, mark required + min 2.
  const isNameField = NAME_KEYWORDS.some((p) => p.test(lower));
  return {
    controlName: name,
    tsType: 'string',
    generator: isNameField
      ? `presets.text({ formControlName: '${name}', label: '${humanise(name)}', required: true, minLength: 2 })`
      : `presets.text({ formControlName: '${name}', label: '${humanise(name)}' })`,
  };
}

function humanise(name: string): string {
  const spaced = name
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dasherize(s: string): string {
  return s
    .replace(/[_\s]+/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function pascalize(s: string): string {
  return dasherize(s)
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function renderComponent(name: string, fields: FieldSpec[]): string {
  const className = pascalize(name) + 'Component';
  const selector = 'app-' + dasherize(name);
  const interfaceName = pascalize(name) + 'Values';

  // The typed interface only includes data-bearing fields (skip buttons).
  const interfaceProps = fields
    .filter((f) => f.tsType)
    .map((f) => `  ${f.controlName}: ${f.tsType};`)
    .join('\n');

  const generators = fields
    .map((f) => `    ${f.generator},`)
    .join('\n');

  const hasInterface = interfaceProps.length > 0;
  const defineFormCall = hasInterface
    ? `defineForm<${interfaceName}>([\n${generators}\n  ])`
    : `[\n${generators}\n  ] as FormField[]`;

  const imports = hasInterface
    ? `import { defineForm, FormEngineEvent, presets } from '@ngx-json-forms/core';`
    : `import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';`;

  return `import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

import { NgxJsonFormComponent, NgxJsonFormDebugComponent } from '@ngx-json-forms/primeng';
${imports}

${
  hasInterface
    ? `interface ${interfaceName} {\n${interfaceProps}\n}\n\n`
    : ''
}@Component({
  selector: '${selector}',
  imports: [NgxJsonFormComponent, NgxJsonFormDebugComponent, JsonPipe],
  template: \`
    <ngx-json-form
      [fieldsInput]="fields"
      (formSubmit)="onSubmit($event)"
      (formChange)="onChange($event)" />

    <!-- Remove this in production — it's only useful while authoring. -->
    <ngx-json-form-debug />

    @if (last(); as e) {
      <h3>{{ e.type }} (valid: {{ e.valid }})</h3>
      <pre>{{ e.values | json }}</pre>
    }
  \`,
})
export class ${className} {
  protected readonly fields = ${defineFormCall};

  protected readonly last = signal<FormEngineEvent | null>(null);

  protected onSubmit(e: FormEngineEvent): void {
    this.last.set(e);
    // TODO: send e.values to your backend.
  }

  protected onChange(e: FormEngineEvent): void {
    this.last.set(e);
  }
}
`;
}

export function generateForm(options: FormGeneratorSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    if (!options.name) {
      throw new SchematicsException('--name is required (e.g. `ng g @ngx-json-forms/primeng:form login`).');
    }

    const fieldNames = (options.fields ?? 'firstName,lastName,email,submit')
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    // Ensure a submit button is present; append if missing.
    const hasSubmit = fieldNames.some((n) => SUBMIT_KEYWORDS.has(n.toLowerCase()));
    if (!hasSubmit) fieldNames.push('submit');

    const fields = fieldNames.map((n, i) => inferField(n, i === fieldNames.length - 1));

    const dasherizedName = dasherize(options.name);
    const baseDir = (options.path ?? 'src/app/forms').replace(/\/+$/, '');
    const targetPath = `${baseDir}/${dasherizedName}/${dasherizedName}.ts`;

    if (tree.exists(targetPath)) {
      throw new SchematicsException(
        `${targetPath} already exists — delete it or pass a different name.`,
      );
    }

    const content = renderComponent(options.name, fields);
    tree.create(targetPath, content);

    const className = pascalize(options.name) + 'Component';
    const selector = 'app-' + dasherizedName;
    context.logger.info(
      `[@ngx-json-forms/primeng:form] created ${targetPath}\n` +
        `  Component: ${className}\n` +
        `  Selector:  <${selector} />\n` +
        `  Fields:    ${fields.map((f) => f.controlName).join(', ')}\n` +
        `\n` +
        `  Drop it into a route:\n` +
        `    { path: '${dasherizedName}', loadComponent: () => import('./forms/${dasherizedName}/${dasherizedName}').then(m => m.${className}) }`,
    );

    return tree;
  };
}
