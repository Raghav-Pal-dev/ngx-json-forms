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

// Angular peer floor is ^21.2.0 — PrimeNG 21.1.x ships templates that
// reference `ChangeDetectionStrategy.Eager` (Angular 21.2+), so installing
// on 21.1.x silently fails inside Vite optimizeDeps with a cryptic
// "Unsupported change detection strategy" later. Failing fast at npm
// install time with a clear ERESOLVE message is the kinder UX.
const PEER_DEPS: Record<string, string> = {
  '@angular/animations': '^21.2.0',
  '@primeng/themes': '^21.0.0',
  primeicons: '^7.0.0',
  primeng: '^21.1.0',
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
        `[@ngx-json-forms/primeng] ${path} not found. Add the provider manually:\n\n` +
          "  import { provideNgxJsonFormsPrimeng } from '@ngx-json-forms/primeng';\n\n" +
          "  // ApplicationConfig.providers:\n" +
          "  //   provideNgxJsonFormsPrimeng(),   // theme + animations + form engine\n",
      );
      return tree;
    }

    let src = tree.read(path)!.toString('utf-8');
    if (
      src.includes('provideNgxJsonFormsPrimeng') ||
      // Don't overwrite a pre-existing custom three-provider setup either.
      src.includes('providePrimeNG')
    ) {
      context.logger.info(
        '[@ngx-json-forms/primeng] providers already wired — skipping app.config.ts edit.',
      );
      return tree;
    }

    // Default theme = Aura. If the user passed --theme=nora etc., import that
    // and pass it through to provideNgxJsonFormsPrimeng's `theme` option.
    const theme = options.theme ?? 'aura';
    const useCustomTheme = theme !== 'aura';
    const themeImportName = theme.charAt(0).toUpperCase() + theme.slice(1);

    // One mega-provider does the work of three. The consumer's
    // app.config.ts gains a single import + a single line in `providers`.
    // For non-default themes we also import the preset and pass it through.
    const newImports = useCustomTheme
      ? [
          `import { provideNgxJsonFormsPrimeng } from '@ngx-json-forms/primeng';`,
          `import ${themeImportName} from '@primeng/themes/${theme}';`,
        ].join('\n')
      : `import { provideNgxJsonFormsPrimeng } from '@ngx-json-forms/primeng';`;

    // Insert imports after the last existing import statement.
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

    // Append the one-line provider call to the providers array.
    const providersRegex = /(providers\s*:\s*\[)/;
    const providerCall = useCustomTheme
      ? `provideNgxJsonFormsPrimeng({ theme: ${themeImportName} })`
      : `provideNgxJsonFormsPrimeng()`;

    if (providersRegex.test(src)) {
      src = src.replace(
        providersRegex,
        `$1\n    ${providerCall},`,
      );
    } else {
      context.logger.warn(
        `[@ngx-json-forms/primeng] could not find a 'providers: [' array in ${path}. Import added, but please add ${providerCall} manually.`,
      );
    }

    tree.overwrite(path, src);
    context.logger.info(
      `[@ngx-json-forms/primeng] wired provideNgxJsonFormsPrimeng (theme: ${theme}) into ${path}.`,
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
