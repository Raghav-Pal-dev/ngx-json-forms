/**
 * JSON Schema → FormField[] adapter.
 *
 * Lets you reuse an existing JSON Schema document (OpenAPI request body,
 * Ajv validator, backend contract, etc.) as the source of truth for an
 * ngx-json-forms form.
 *
 * Maps the **common subset** of JSON Schema Draft 7 / 2019-09:
 *
 *   type: 'object'                  → group of fields (one per property)
 *   type: 'string'                  → text input
 *   type: 'string', format: 'email' → email input + email validator
 *   type: 'string', format: 'password' → password input
 *   type: 'string', format: 'date'  → date picker
 *   type: 'string', format: 'date-time' → date picker + time
 *   type: 'string', format: 'time'  → time picker
 *   type: 'string', format: 'uri'   → url input
 *   type: 'string', enum: [...]     → select with the enum values as options
 *   type: 'number' / 'integer'      → number input
 *   type: 'boolean'                 → toggle
 *   type: 'array' (object items)    → repeater
 *   type: 'array' (string items + enum) → multiSelect
 *   $ref: '#/definitions/Foo'       → resolved inline (in-document only)
 *
 *   required: [...]                 → field.validations.rules.required
 *   minLength / maxLength           → validations.rules.minLength / maxLength
 *   minimum / maximum               → validations.rules.min / max
 *   pattern                         → validations.rules.pattern
 *   title                           → field.label
 *   description                     → field.config.attributes.info
 *   default                         → field.config.attributes.value
 *   readOnly                        → field.config.attributes.readonly
 *   examples[0]                     → field.placeholder (when no title)
 *
 * **Not supported (yet):**
 *   - allOf / anyOf / oneOf
 *   - external $refs (anything not starting with `#/`)
 *   - additionalProperties / patternProperties
 *   - dependencies
 *   - Tuple-form arrays (items as an array)
 *
 * Returns a flat `FormField[]` ready to feed `<ngx-json-form fieldsInput>`
 * or `defineForm<T>()`.
 */
import { FormField, FormSchema, ValidationRules, InputType } from './types';

/**
 * A minimal local type for JSON Schema — enough to express the subset we
 * map. We don't depend on `@types/json-schema` to avoid pulling another
 * dev dependency into core.
 */
export interface JsonSchema {
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
  title?: string;
  description?: string;
  default?: unknown;
  format?: string;
  enum?: unknown[];
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  required?: string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  readOnly?: boolean;
  examples?: unknown[];
  $ref?: string;
  /** Draft-07 location for sub-schemas. */
  definitions?: Record<string, JsonSchema>;
  /** Draft 2019-09+ replacement for `definitions`. */
  $defs?: Record<string, JsonSchema>;
  // Allow any extension keyword (e.g. `x-ui:hidden`) through without
  // typing them — consumers may use a custom mapper to react to them later.
  [extension: string]: unknown;
}

export interface FormFieldsFromJsonSchemaOptions {
  /**
   * Layout overrides per control name. Useful when the schema's natural
   * order doesn't match the visual order you want, or to widen / narrow
   * columns. Anything you don't override gets a sensible default
   * (`columnSpan: 12`, ascending `order`).
   */
  layoutOverrides?: Record<string, NonNullable<FormField['layout']>>;
}

/**
 * Convert a JSON Schema document to `FormField[]`.
 *
 * The top-level schema is expected to be `{ type: 'object', properties: { … } }`.
 * Other top-level shapes are wrapped into a single-control form
 * (rare in practice).
 */
export function formFieldsFromJsonSchema(
  schema: JsonSchema,
  options: FormFieldsFromJsonSchemaOptions = {},
): FormField[] {
  const root = resolveRef(schema, schema);
  const requiredSet = new Set(root.required ?? []);
  const props = root.properties ?? {};
  let order = 1;
  const fields: FormField[] = [];

  for (const [name, rawProp] of Object.entries(props)) {
    const prop = resolveRef(rawProp, schema);
    const field = mapPropertyToField(name, prop, requiredSet.has(name), schema);
    if (!field) continue;
    field.layout = options.layoutOverrides?.[name] ?? { columnSpan: 12, order: order++ };
    fields.push(field);
  }
  return fields;
}

/**
 * Same as `formFieldsFromJsonSchema` but returns a full `FormSchema`
 * (with title / description from the JSON Schema's top level), so it
 * drops straight into `<ngx-json-form [schema]>`.
 */
export function formSchemaFromJsonSchema(
  schema: JsonSchema,
  options: FormFieldsFromJsonSchemaOptions = {},
): FormSchema {
  return {
    title: schema.title,
    description: schema.description,
    fields: formFieldsFromJsonSchema(schema, options),
  };
}

// ─── internals ───────────────────────────────────────────────────────────

function mapPropertyToField(
  name: string,
  schema: JsonSchema,
  required: boolean,
  root: JsonSchema,
): FormField | null {
  const validations = buildValidations(schema, required);

  // Nested object → group
  if (schema.type === 'object' && schema.properties) {
    const groupFields: FormField[] = [];
    const childRequired = new Set(schema.required ?? []);
    let order = 1;
    for (const [childName, rawChild] of Object.entries(schema.properties)) {
      const child = resolveRef(rawChild, root);
      const childField = mapPropertyToField(childName, child, childRequired.has(childName), root);
      if (!childField) continue;
      childField.layout = childField.layout ?? { columnSpan: 12, order: order++ };
      groupFields.push(childField);
    }
    return {
      formControlName: name,
      label: schema.title,
      config: {
        attributes: {
          inputType: 'group',
          groupFields,
          ...(schema.description ? { info: schema.description } : {}),
        },
      },
      validations,
    };
  }

  // Array → repeater (objects) or multiSelect (strings with enum)
  if (schema.type === 'array' && schema.items) {
    const items = resolveRef(schema.items, root);

    if (items.type === 'string' && items.enum?.length) {
      // Multi-select of fixed options
      return {
        formControlName: name,
        label: schema.title,
        placeholder: schema.examples?.[0] ? String(schema.examples[0]) : undefined,
        config: {
          attributes: {
            inputType: 'multiSelect',
            options: items.enum.map((v) => ({ label: String(v), value: v })),
            optionLabel: 'label',
            optionValue: 'value',
            acceptedEvents: ['change'],
            ...(schema.description ? { info: schema.description } : {}),
          },
        },
        validations,
      };
    }

    if (items.type === 'object' && items.properties) {
      // Repeater
      const itemFields: FormField[] = [];
      const itemRequired = new Set(items.required ?? []);
      let order = 1;
      for (const [childName, rawChild] of Object.entries(items.properties)) {
        const child = resolveRef(rawChild, root);
        const childField = mapPropertyToField(childName, child, itemRequired.has(childName), root);
        if (!childField) continue;
        childField.layout = childField.layout ?? { columnSpan: 12, order: order++ };
        itemFields.push(childField);
      }
      return {
        formControlName: name,
        label: schema.title,
        config: {
          attributes: {
            inputType: 'repeater',
            itemFields,
            ...(schema.description ? { info: schema.description } : {}),
            ...(required ? { minRows: 1 } : {}),
          },
        },
        validations,
      };
    }
    // Unknown array shape — skip
    return null;
  }

  // Scalar leaf field
  const { inputType, extraAttrs } = mapScalar(schema);
  if (!inputType) return null;

  return {
    formControlName: name,
    label: schema.title,
    placeholder: schema.examples?.[0] ? String(schema.examples[0]) : undefined,
    config: {
      attributes: {
        inputType,
        ...extraAttrs,
        ...(schema.readOnly ? { readonly: true, disabled: true } : {}),
        ...(schema.default !== undefined ? { value: schema.default } : {}),
        ...(schema.description ? { info: schema.description } : {}),
      },
    },
    validations,
  };
}

function mapScalar(schema: JsonSchema): {
  inputType: InputType | null;
  extraAttrs: Record<string, unknown>;
} {
  // enum on a string/number scalar → select
  if (schema.enum?.length) {
    return {
      inputType: 'select',
      extraAttrs: {
        options: schema.enum.map((v) => ({ label: String(v), value: v })),
        optionLabel: 'label',
        optionValue: 'value',
        showClear: true,
        acceptedEvents: ['change'],
      },
    };
  }

  if (schema.type === 'boolean') {
    return {
      inputType: 'toggle',
      extraAttrs: { acceptedEvents: ['change'] },
    };
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return {
      inputType: 'text',
      extraAttrs: {
        type: 'number',
        ...(schema.type === 'integer' ? { keyfilter: 'int' } : {}),
        acceptedEvents: ['change', 'blur'],
      },
    };
  }

  if (schema.type === 'string') {
    switch (schema.format) {
      case 'email':
        return {
          inputType: 'text',
          extraAttrs: {
            type: 'email',
            fieldIcon: 'pi pi-envelope',
            fieldPos: 'left',
            acceptedEvents: ['change', 'blur'],
          },
        };
      case 'password':
        return {
          inputType: 'password',
          extraAttrs: { toggleMask: true, acceptedEvents: ['change', 'blur'] },
        };
      case 'date':
        return {
          inputType: 'datePicker',
          extraAttrs: { showIcon: true, acceptedEvents: ['select', 'blur'] },
        };
      case 'date-time':
        return {
          inputType: 'datePicker',
          extraAttrs: {
            showIcon: true,
            showTime: true,
            hourFormat: '24',
            acceptedEvents: ['select', 'blur'],
          },
        };
      case 'time':
        return { inputType: 'time', extraAttrs: { acceptedEvents: ['select'] } };
      case 'uri':
      case 'uri-reference':
        return {
          inputType: 'text',
          extraAttrs: {
            type: 'url',
            fieldIcon: 'pi pi-link',
            fieldPos: 'left',
            acceptedEvents: ['change', 'blur'],
          },
        };
      case 'tel':
        return {
          inputType: 'text',
          extraAttrs: {
            type: 'tel',
            keyfilter: 'int',
            fieldIcon: 'pi pi-phone',
            fieldPos: 'left',
            acceptedEvents: ['change', 'blur'],
          },
        };
      default:
        return {
          inputType: 'text',
          extraAttrs: { acceptedEvents: ['change', 'blur'] },
        };
    }
  }

  return { inputType: null, extraAttrs: {} };
}

function buildValidations(
  schema: JsonSchema,
  required: boolean,
): FormField['validations'] {
  const rules: ValidationRules = {};
  if (required) rules.required = true;
  if (schema.minLength !== undefined) rules.minLength = schema.minLength;
  if (schema.maxLength !== undefined) rules.maxLength = schema.maxLength;
  if (schema.minimum !== undefined) rules.min = schema.minimum;
  if (schema.maximum !== undefined) rules.max = schema.maximum;
  if (schema.pattern) rules.pattern = schema.pattern;
  if (schema.type === 'string' && schema.format === 'email') rules.email = true;
  return Object.keys(rules).length ? { rules } : undefined;
}

/**
 * Resolve in-document $ref ('#/definitions/Foo' or '#/$defs/Foo' or '#/...').
 * Returns the original schema for non-$ref nodes. External $refs are
 * returned as-is — callers should pre-bundle their schema first.
 */
function resolveRef(schema: JsonSchema, root: JsonSchema): JsonSchema {
  if (!schema || typeof schema !== 'object' || !schema.$ref) return schema;
  if (!schema.$ref.startsWith('#/')) return schema;
  const segments = schema.$ref.slice(2).split('/').map(decodeRefSegment);
  let cur: unknown = root;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return schema; // unresolvable — give up and keep the $ref
    }
  }
  return (cur as JsonSchema) ?? schema;
}

function decodeRefSegment(seg: string): string {
  return seg.replace(/~1/g, '/').replace(/~0/g, '~');
}
