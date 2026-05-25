// Post-build step. ng-packagr's generated .npmignore excludes ALL nested
// package.json files (`**/package.json`), but we need to ship
// `schematics/package.json` so Node resolves the compiled schematic
// scripts as CommonJS. (The parent package.json declares `"type":
// "module"`; without the schematics-local override `ng add` blows up
// with "exports is not defined in ES module scope".)
//
// This script appends a negation rule that whitelists the one file we need.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const npmignore = resolve('dist/packages/primeng/.npmignore');
if (!existsSync(npmignore)) {
  console.error(`fix-npmignore: ${npmignore} not found — did 'nx build primeng' run first?`);
  process.exit(1);
}

const original = readFileSync(npmignore, 'utf8');
const marker = '!schematics/package.json';
if (original.includes(marker)) {
  console.log('fix-npmignore: schematics/package.json already whitelisted, nothing to do.');
  process.exit(0);
}

const patched = `${original.trimEnd()}\n\n# Whitelist the schematics-local package.json so ng add can resolve the\n# schematic factory as CommonJS at install time.\n${marker}\n`;
writeFileSync(npmignore, patched);
console.log(`fix-npmignore: appended ${marker} to ${npmignore}`);
