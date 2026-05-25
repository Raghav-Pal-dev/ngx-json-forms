import {
  formFieldsFromJsonSchema,
  formSchemaFromJsonSchema,
  JsonSchema,
} from './json-schema';

describe('formFieldsFromJsonSchema', () => {
  it('maps a flat object schema → FormField[] with correct inputType + label + required', () => {
    const schema: JsonSchema = {
      type: 'object',
      required: ['firstName', 'email'],
      properties: {
        firstName: { type: 'string', title: 'First name', minLength: 2 },
        lastName: { type: 'string', title: 'Last name' },
        email: { type: 'string', format: 'email', title: 'Email' },
        age: { type: 'integer', title: 'Age', minimum: 0, maximum: 120 },
      },
    };

    const fields = formFieldsFromJsonSchema(schema);

    expect(fields).toHaveLength(4);

    const firstName = fields.find((f) => f.formControlName === 'firstName')!;
    expect(firstName.label).toBe('First name');
    expect(firstName.config.attributes.inputType).toBe('text');
    expect(firstName.validations?.rules).toEqual({ required: true, minLength: 2 });

    const email = fields.find((f) => f.formControlName === 'email')!;
    expect(email.config.attributes.inputType).toBe('text');
    expect(email.config.attributes['type']).toBe('email');
    expect(email.validations?.rules).toEqual({ required: true, email: true });

    const age = fields.find((f) => f.formControlName === 'age')!;
    expect(age.config.attributes.inputType).toBe('text');
    expect(age.config.attributes['type']).toBe('number');
    expect(age.config.attributes['keyfilter']).toBe('int');
    expect(age.validations?.rules).toEqual({ min: 0, max: 120 });
  });

  it('maps enum string → select with options', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          title: 'Role',
          enum: ['admin', 'editor', 'viewer'],
        },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('select');
    expect(field.config.attributes['options']).toEqual([
      { label: 'admin', value: 'admin' },
      { label: 'editor', value: 'editor' },
      { label: 'viewer', value: 'viewer' },
    ]);
  });

  it('maps boolean → toggle', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: { acceptTerms: { type: 'boolean', title: 'I accept' } },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('toggle');
  });

  it('maps array of objects → repeater with nested itemFields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        phones: {
          type: 'array',
          title: 'Phones',
          items: {
            type: 'object',
            required: ['number'],
            properties: {
              kind: { type: 'string', enum: ['home', 'work'] },
              number: { type: 'string', pattern: '^[0-9]{7,}$' },
            },
          },
        },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('repeater');
    const itemFields = field.config.attributes['itemFields'] as Array<{ formControlName: string; config: { attributes: { inputType: string } } }>;
    expect(itemFields).toHaveLength(2);
    expect(itemFields[0].formControlName).toBe('kind');
    expect(itemFields[0].config.attributes.inputType).toBe('select');
    expect(itemFields[1].formControlName).toBe('number');
  });

  it('maps array of enum strings → multiSelect', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string', enum: ['ng', 'rx', 'ts'] },
        },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('multiSelect');
    expect(field.config.attributes['options']).toHaveLength(3);
  });

  it('maps nested object → group with groupFields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        address: {
          type: 'object',
          title: 'Address',
          required: ['city'],
          properties: {
            street: { type: 'string' },
            city: { type: 'string' },
          },
        },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('group');
    const groupFields = field.config.attributes['groupFields'] as Array<{ formControlName: string; validations?: { rules?: { required?: boolean } } }>;
    expect(groupFields.map((f) => f.formControlName)).toEqual(['street', 'city']);
    expect(groupFields.find((f) => f.formControlName === 'city')?.validations?.rules?.required).toBe(true);
  });

  it('resolves in-document $ref ($defs and definitions)', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        kind: { $ref: '#/$defs/RoleEnum' },
      },
      $defs: {
        RoleEnum: { type: 'string', enum: ['admin', 'user'] },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes.inputType).toBe('select');
    expect(field.config.attributes['options']).toEqual([
      { label: 'admin', value: 'admin' },
      { label: 'user', value: 'user' },
    ]);
  });

  it('honours default + readOnly + description', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        country: {
          type: 'string',
          title: 'Country',
          default: 'IN',
          readOnly: true,
          description: 'Determined from your IP on signup.',
        },
      },
    };
    const [field] = formFieldsFromJsonSchema(schema);
    expect(field.config.attributes['value']).toBe('IN');
    expect(field.config.attributes['readonly']).toBe(true);
    expect(field.config.attributes['disabled']).toBe(true);
    expect(field.config.attributes['info']).toBe('Determined from your IP on signup.');
  });

  it('assigns sensible default layout (columnSpan: 12, ascending order)', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'string' },
      },
    };
    const fields = formFieldsFromJsonSchema(schema);
    expect(fields.map((f) => f.layout)).toEqual([
      { columnSpan: 12, order: 1 },
      { columnSpan: 12, order: 2 },
      { columnSpan: 12, order: 3 },
    ]);
  });

  it('respects layoutOverrides', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
    };
    const fields = formFieldsFromJsonSchema(schema, {
      layoutOverrides: {
        firstName: { columnSpan: 6, order: 1 },
        lastName: { columnSpan: 6, order: 2 },
      },
    });
    expect(fields[0].layout).toEqual({ columnSpan: 6, order: 1 });
    expect(fields[1].layout).toEqual({ columnSpan: 6, order: 2 });
  });
});

describe('formSchemaFromJsonSchema', () => {
  it('wraps fields with the schema-level title + description', () => {
    const schema: JsonSchema = {
      type: 'object',
      title: 'Sign up',
      description: 'Create your account',
      properties: { email: { type: 'string', format: 'email' } },
    };
    const out = formSchemaFromJsonSchema(schema);
    expect(out.title).toBe('Sign up');
    expect(out.description).toBe('Create your account');
    expect(out.fields).toHaveLength(1);
  });
});
