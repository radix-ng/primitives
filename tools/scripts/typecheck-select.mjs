import { formatDiagnostics, performCompilation, readConfiguration } from '@angular/compiler-cli';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const workspace = fileURLToPath(new URL('../../', import.meta.url));
const fixture = resolve(workspace, 'tools/typecheck/select');
const config = readConfiguration(resolve(fixture, 'tsconfig.json'));
const errors = (diagnostics) => diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);

function compile(rootNames) {
    return errors(performCompilation({ rootNames, options: config.options }).diagnostics);
}

const positiveErrors = [...errors(config.errors), ...compile(config.rootNames)];
if (positiveErrors.length) {
    throw new Error(`Valid Select consumers must compile:\n${formatDiagnostics(positiveErrors)}`);
}

const negativeFile = resolve(fixture, 'negative.ts');
const source = readFileSync(negativeFile, 'utf8');
const markers = [...source.matchAll(/<!-- @expect-error ([\w-]+) -->/g)];
const expectations = markers.map((match, index) => ({
    name: match[1],
    start: match.index + match[0].length,
    end: markers[index + 1]?.index ?? source.indexOf('`', match.index + match[0].length)
}));
const negativeErrors = compile([...config.rootNames, negativeFile]);
const seen = new Set();
const unexpected = [];
for (const diagnostic of negativeErrors) {
    const name =
        diagnostic.file?.fileName === negativeFile && diagnostic.start !== undefined
            ? expectations.find((item) => diagnostic.start >= item.start && diagnostic.start < item.end)?.name
            : undefined;
    if (name && (diagnostic.code === 2322 || diagnostic.code === 2339 || diagnostic.code === 2345)) {
        seen.add(name);
    } else {
        unexpected.push(diagnostic);
    }
}
const missing = expectations.map((item) => item.name).filter((name) => !seen.has(name));
if (unexpected.length || missing.length) {
    throw new Error(
        `Select type contract failed. Missing errors: ${missing.join(', ')}\n${formatDiagnostics(unexpected)}`
    );
}
console.log(`Select AOT contract: valid consumers compile; ${seen.size} invalid bindings are rejected.`);
