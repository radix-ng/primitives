// One-off Angular 22 upgrade codemod.
// Mirrors @angular/core:change-detection-eager: adds
// `changeDetection: ChangeDetectionStrategy.Eager` to every @Component that lacks
// an explicit strategy (preserving pre-v22 "check always" behavior), and ensures
// ChangeDetectionStrategy is imported from @angular/core.
//
// Usage: node tools/scripts/migrations/add-eager-cd.mjs [--write]
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import ts from 'typescript';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const SCAN_DIRS = ['packages', 'apps'];
const IGNORE = new Set(['node_modules', 'dist', 'tmp', '.nx', '.angular']);

function walk(dir, out) {
    for (const name of readdirSync(dir)) {
        if (IGNORE.has(name)) continue;
        const full = join(dir, name);
        const st = statSync(full);
        if (st.isDirectory()) walk(full, out);
        else if (extname(full) === '.ts' && !full.endsWith('.d.ts')) out.push(full);
    }
}

const files = [];
for (const d of SCAN_DIRS) walk(join(ROOT, d), files);

let changedFiles = 0;
let changedComponents = 0;

for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes('@Component')) continue;

    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const inserts = []; // { pos, text }

    const visit = (node) => {
        if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
            const expr = node.expression;
            if (ts.isIdentifier(expr.expression) && expr.expression.text === 'Component') {
                const arg = expr.arguments[0];
                if (arg && ts.isObjectLiteralExpression(arg)) {
                    const hasCd = arg.properties.some(
                        (p) => p.name && ts.isIdentifier(p.name) && p.name.text === 'changeDetection'
                    );
                    if (!hasCd) {
                        // Indentation: match the first existing property, else brace indent + 4.
                        let indent = '    ';
                        if (arg.properties.length > 0) {
                            const lc = sf.getLineAndCharacterOfPosition(arg.properties[0].getStart(sf));
                            const lineStart = sf.getPositionOfLineAndCharacter(lc.line, 0);
                            indent = text.slice(lineStart, arg.properties[0].getStart(sf)).match(/^\s*/)[0];
                        }
                        const openBrace = arg.getStart(sf) + 1;
                        inserts.push({
                            pos: openBrace,
                            text: `\n${indent}changeDetection: ChangeDetectionStrategy.Eager,`
                        });
                        changedComponents++;
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);

    if (inserts.length === 0) continue;

    // Ensure ChangeDetectionStrategy import from @angular/core.
    let importInsert = null;
    if (!/\bChangeDetectionStrategy\b/.test(text.replace(/changeDetection: ChangeDetectionStrategy/g, ''))) {
        let coreImport = null;
        sf.forEachChild((node) => {
            if (
                ts.isImportDeclaration(node) &&
                ts.isStringLiteral(node.moduleSpecifier) &&
                node.moduleSpecifier.text === '@angular/core' &&
                node.importClause?.namedBindings &&
                ts.isNamedImports(node.importClause.namedBindings)
            ) {
                coreImport = node.importClause.namedBindings;
            }
        });
        if (coreImport) {
            // Insert as a new named specifier right after `{`.
            const braceAfter = coreImport.getStart(sf) + 1;
            importInsert = { pos: braceAfter, text: ` ChangeDetectionStrategy,` };
        } else {
            importInsert = { pos: 0, text: `import { ChangeDetectionStrategy } from '@angular/core';\n` };
        }
    }

    let out = text;
    const all = [...inserts];
    if (importInsert) all.push(importInsert);
    all.sort((a, b) => b.pos - a.pos);
    for (const ins of all) out = out.slice(0, ins.pos) + ins.text + out.slice(ins.pos);

    changedFiles++;
    if (WRITE) writeFileSync(file, out);
    else console.log(`would patch ${file.replace(ROOT + '/', '')} (${inserts.length} component(s))`);
}

console.log(`\n${WRITE ? 'Patched' : 'Would patch'} ${changedComponents} component(s) across ${changedFiles} file(s).`);
