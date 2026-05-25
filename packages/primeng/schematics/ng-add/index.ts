/**
 * `ng add @ngx-json-forms/primeng` — one-shot setup.
 *
 * 1. Adds the peer deps to package.json (angular/animations, primeng,
 *    @primeng/themes, primeicons, quill).
 * 2. Schedules `npm install` (skippable with --skip-install).
 * 3. Wires providePrimeNG + provideAnimationsAsync + provideNgxJsonForms
 *    into the consumer's app.config.ts (standalone API).
 * 4. Adds `@import 'primeicons/primeicons.css';` to the first styles
 *    file it finds.
 *
 * Designed to be lenient: every step that can't auto-edit safely prints
 * an instructive log line so the user can finish manually.
 */
import {
  Rule,
  SchematicContext,
  Tree,
  chain,
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { NgAddSchema } from './schema';

const PEER_DEPS: Record<string, string> = {
  '@angular/animations': '^21.0.0',
  '@primeng/themes': '^21.0.0',
  primeicons: '^7.0.0',
  primeng: '^21.0.0',
  quill: '^2.0.0',
};

function addPeerDeps(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const pkgPath = '/package.json';
    if (!tree.exists(pkgPath)) {
      context.logger.warn(
        '[@ngx-json-forms/primeng] no package.json at workspace root — skipping dep install.',
      );
      return tree;
    }
    const pkg = JSON.parse(tree.read(pkgPath)!.toString('utf-8'));
    pkg.dependencies = pkg.dependencies ?? {};

    let added = 0;
    for (const [name, range] of Object.entries(PEER_DEPS)) {
      if (!pkg.dependencies[name] && !pkg.devDependencies?.[name]) {
        pkg.dependencies[name] = range;
        added++;
      }
    }
    if (added) {
      tree.overwrite(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      context.logger.info(
        `[@ngx-json-forms/primeng] added ${added} peer dependency entries to package.json.`,
      );
    } else {
      context.logger.info(
        '[@ngx-json-forms/primeng] all peer dependencies already present.',
      );
    }
    return tree;
  };
}

function installDeps(options: NgAddSchema): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    if (options.skipInstall) {
      context.logger.info(
        '[@ngx-json-forms/primeng] --skip-install set, not running npm install.',
      );
      return;
    }
    context.addTask(new NodePackageInstallTask());
    context.logger.info('[@ngx-json-forms/primeng] scheduled npm install.');
  };
}

function patchAppConfig(options: NgAddSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const path = '/src/app/app.config.ts';
    if (!tree.exists(path)) {
      context.logger.warn(
        `[@ngx-json-forms/primeng] ${path} not found. Add the providers manually:\n\n` +
          "  import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';\n" +
          "  import { providePrimeNG } from 'primeng/config';\n" +
          "  import Aura from '@primeng/themes/aura';\n" +
          "  import { provideNgxJsonForms } from '@ngx-json-forms/core';\n\n" +
          "  // ApplicationConfig.providers:\n" +
          "  //   provideAnimationsAsync(),\n" +
          "  //   providePrimeNG({ theme: { preset: Aura } }),\n" +
          "  //   provideNgxJsonForms(),\n",
      );
      return tree;
    }

    let src = tree.read(path)!.toString('utf-8');
    if (src.includes('providePrimeNG')) {
      context.logger.info(
        '[@ngx-json-forms/primeng] providePrimeNG already wired — skipping app.config.ts edit.',
      );
      return tree;
    }

    const theme = options.theme ?? 'aura';
    const themeImportName = theme.charAt(0).toUpperCase() + theme.slice(1);

    const newImports = [
      `import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';`,
      `import { providePrimeNG } from 'primeng/config';`,
      `import ${themeImportName} from '@primeng/themes/${theme}';`,
      `import { provideNgxJsonForms } from '@ngx-json-forms/core';`,
    ].join('\n');

    // Insert imports after the last existing import statement
    const importRegex = /^import .+?;$/gm;
    let lastImportEnd = 0;
    let m: RegExpExecArray | null;
    while ((m = importRegex.exec(src)) !== null) {
      lastImportEnd = m.index + m[0].length;
    }
    src =
      src.slice(0, lastImportEnd) +
      '\n' +
      newImports +
      src.slice(lastImportEnd);

    // Insert providers — find `providers: [` and append our entries
    const providersRegex = /(providers\s*:\s*\[)/;
    if (providersRegex.test(src)) {
      src = src.replace(
        providersRegex,
        `$1\n` +
          `    provideAnimationsAsync(),\n` +
          `    providePrimeNG({ theme: { preset: ${themeImportName} } }),\n` +
          `    provideNgxJsonForms(),`,
      );
    } else {
      context.logger.warn(
        `[@ngx-json-forms/primeng] could not find a 'providers: [' array in ${path}. Imports added, but please add the three provider calls manually.`,
      );
    }

    tree.overwrite(path, src);
    context.logger.info(
      `[@ngx-json-forms/primeng] wired providers (theme: ${theme}) into ${path}.`,
    );
    return tree;
  };
}

function patchStyles(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    for (const path of [
      '/src/styles.css',
      '/src/styles.scss',
      '/src/styles.sass',
      '/src/styles.less',
    ]) {
      if (!tree.exists(path)) continue;

      const src = tree.read(path)!.toString('utf-8');
      if (src.includes('primeicons')) {
        context.logger.info(
          `[@ngx-json-forms/primeng] primeicons already imported in ${path} — skipping.`,
        );
        return tree;
      }
      tree.overwrite(path, `@import 'primeicons/primeicons.css';\n\n${src}`);
      context.logger.info(
        `[@ngx-json-forms/primeng] added primeicons import to ${path}.`,
      );
      return tree;
    }

    context.logger.warn(
      "[@ngx-json-forms/primeng] no global styles file found (src/styles.{css,scss,sass,less}). Add this line to your global styles manually:\n  @import 'primeicons/primeicons.css';",
    );
    return tree;
  };
}

export function ngAdd(options: NgAddSchema): Rule {
  return chain([
    addPeerDeps(),
    installDeps(options),
    patchAppConfig(options),
    patchStyles(),
  ]);
}
