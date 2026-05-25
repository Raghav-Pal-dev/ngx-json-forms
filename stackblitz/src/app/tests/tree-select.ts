import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { NgxJsonFormComponent } from '@ngx-json-forms/primeng';
import { FormEngineEvent, FormField, presets } from '@ngx-json-forms/core';

const orgChart = [
  {
    key: '1', label: 'Engineering', children: [
      { key: '1-0', label: 'Frontend', children: [
        { key: '1-0-0', label: 'Web' },
        { key: '1-0-1', label: 'Mobile' },
      ]},
      { key: '1-1', label: 'Backend' },
      { key: '1-2', label: 'Platform' },
    ],
  },
  {
    key: '2', label: 'Sales', children: [
      { key: '2-0', label: 'North America' },
      { key: '2-1', label: 'EMEA' },
      { key: '2-2', label: 'APAC' },
    ],
  },
  { key: '3', label: 'HR' },
  { key: '4', label: 'Finance' },
];

const permissions = [
  { key: 'read', label: 'Read', children: [
    { key: 'read.posts', label: 'Posts' },
    { key: 'read.comments', label: 'Comments' },
    { key: 'read.users', label: 'Users' },
  ]},
  { key: 'write', label: 'Write', children: [
    { key: 'write.posts', label: 'Posts' },
    { key: 'write.comments', label: 'Comments' },
  ]},
  { key: 'admin', label: 'Admin', children: [
    { key: 'admin.users', label: 'Manage users' },
    { key: 'admin.billing', label: 'Manage billing' },
  ]},
];

@Component({
  selector: 'playground-tree-select',
  imports: [NgxJsonFormComponent, JsonPipe],
  template: `
    <div class="card">
      <h1>treeSelect field (1.13.0)</h1>
      <p class="muted">
        Hierarchical multi-select for categories, org charts, file
        trees, or permission grids. Three selection modes —
        <code>'single'</code>, <code>'multiple'</code>,
        <code>'checkbox'</code> — each producing a different value
        shape (see the live JSON below).
      </p>
      <ngx-json-form
        [fieldsInput]="fields()"
        (formSubmit)="onSubmit($event)"
        (formChange)="onChange($event)"
      />
      @if (last(); as e) {
        <h2>{{ e.type }} ({{ e.valid ? 'valid' : 'invalid' }})</h2>
        <pre>{{ e.values | json }}</pre>
      }
    </div>
  `,
})
export class TreeSelectComponent {
  protected readonly fields = signal<FormField[]>([
    presets.text({ formControlName: 'employee', label: 'Employee name', required: true }),

    // Single-select: value is TreeNode | null.
    presets.treeSelect({
      formControlName: 'department',
      label: 'Department (single)',
      nodes: orgChart,
      showClear: true,
      required: true,
    }),

    // Multiple-select with filter: value is TreeNode[].
    presets.treeSelect({
      formControlName: 'regions',
      label: 'Sales regions (multiple + filter)',
      nodes: orgChart,
      mode: 'multiple',
      display: 'chip',
      filter: true,
    }),

    // Checkbox mode: value is { [key]: { checked, partialChecked } }.
    presets.treeSelect({
      formControlName: 'permissions',
      label: 'Permissions (checkbox tree)',
      nodes: permissions,
      mode: 'checkbox',
      display: 'chip',
    }),

    presets.submit({ label: 'Save' }),
  ]);
  protected readonly last = signal<FormEngineEvent | null>(null);
  protected onSubmit(e: FormEngineEvent): void { this.last.set(e); }
  protected onChange(e: FormEngineEvent): void { this.last.set(e); }
}
