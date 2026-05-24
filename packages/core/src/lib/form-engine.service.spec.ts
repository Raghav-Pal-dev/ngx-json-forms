import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { FieldRegistry } from './field-registry.service';
import { FormEngineService } from './form-engine.service';
import { FormField } from './types';

describe('FormEngineService', () => {
  let service: FormEngineService;
  let registry: FieldRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormEngineService);
    registry = TestBed.inject(FieldRegistry);
  });

  it('builds a FormGroup from a flat FormField[]', () => {
    const fields: FormField[] = [
      {
        formControlName: 'firstName',
        config: { attributes: { inputType: 'text' } },
        validations: { rules: { required: true } },
      },
      {
        formControlName: 'email',
        config: { attributes: { inputType: 'text' } },
        validations: { rules: { required: true, email: true } },
      },
    ];

    const group = service.buildFormGroup(fields);

    expect(group).toBeInstanceOf(FormGroup);
    expect(group.get('firstName')).toBeTruthy();
    expect(group.get('email')).toBeTruthy();
    expect(group.get('firstName')?.valid).toBe(false); // required, no value
  });

  it('strips transient fields from the submit payload', () => {
    const fields: FormField[] = [
      {
        formControlName: 'kept',
        config: { attributes: { inputType: 'text', value: 'A' } },
      },
      {
        formControlName: 'temp',
        transient: true,
        config: { attributes: { inputType: 'text', value: 'B' } },
      },
    ];

    const group = service.buildFormGroup(fields);
    service.register(group, fields);

    const payload = service.buildSubmitPayload();
    expect(payload).toEqual({ kept: 'A' });
    expect('temp' in payload).toBe(false);
  });

  it('recomputes a computed field when its dependencies change', () => {
    registry.registerComputation('fullName', (deps) => {
      const f = (deps['firstName'] as string | undefined) ?? '';
      const l = (deps['lastName'] as string | undefined) ?? '';
      return [f, l].filter(Boolean).join(' ');
    });

    const fields: FormField[] = [
      { formControlName: 'firstName', config: { attributes: { inputType: 'text' } } },
      { formControlName: 'lastName', config: { attributes: { inputType: 'text' } } },
      {
        formControlName: 'fullName',
        computed: { deps: ['firstName', 'lastName'], fn: 'fullName' },
        config: { attributes: { inputType: 'text' } },
      },
    ];

    const group = service.buildFormGroup(fields);
    service.register(group, fields);
    service.setupComputedFields(group, fields);

    group.get('firstName')?.setValue('John');
    group.get('lastName')?.setValue('Doe');

    expect(group.get('fullName')?.value).toBe('John Doe');
  });
});
